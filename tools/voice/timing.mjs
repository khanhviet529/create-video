#!/usr/bin/env node
/**
 * Per-shot timing checkpoint: measured narration against planned shot durations.
 *
 *   node tools/voice/timing.mjs <video-id>
 *
 * Reads VOICE_PROVENANCE.yaml (measured seconds per authored paragraph) and
 * shot_plan.yaml (`narration_segments: [a, b]` per shot, plus planned duration), and
 * emits one verdict per shot.
 *
 * HEADROOM is the number that matters: planned − speech. It is the silence the shot
 * holds around its narration, and in this library that silence is designed — E01's
 * explanatory pauses were deliberate. So a verdict is never "does the audio fit" alone;
 * it is "is the remaining silence the amount this beat wants".
 *
 * The bands below are stated as thresholds so they can be argued with, not buried:
 *   < 0     speech does not fit at all
 *   0–0.6   fits with no room to breathe
 *   0.6–4.0 a pause a viewer reads as intent
 *   > 4.0   silence a viewer reads as dead air
 *
 * SHIFT_BOUNDARY is only proposed for ADJACENT shots where one is short and its
 * neighbour is long: moving the cut fixes both without changing the total. It is
 * preferred over EXTEND+SHORTEN because the video's runtime is fixed by the package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const id = process.argv[2];
if (!id) { console.error('usage: node tools/voice/timing.mjs <video-id>'); process.exit(1); }

const vdir = path.join(ROOT, 'videos', id);
const prov = YAML.parse(fs.readFileSync(path.join(vdir, 'VOICE_PROVENANCE.yaml'), 'utf8'));
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));

const segs = prov.segments || [];
if (!segs.length) { console.error('VOICE_PROVENANCE.yaml carries no segments'); process.exit(1); }

const shots = (plan.shots || []).filter((s) => Array.isArray(s.narration_segments));
const TIGHT = 0.6, LOOSE = 4.0;

const rows = shots.map((s) => {
  const [a, b] = s.narration_segments;
  const mine = segs.filter((x) => x.index >= a && x.index <= b);
  const speech = Number(mine.reduce((t, x) => t + x.duration, 0).toFixed(2));
  const planned = s.duration;
  const head = Number((planned - speech).toFixed(2));
  let verdict;
  if (head < 0) verdict = 'RETHINK';
  else if (head < TIGHT) verdict = 'EXTEND';
  else if (head > LOOSE) verdict = 'SHORTEN';
  else verdict = 'KEEP';
  return { id: s.id, segs: `${a}-${b}`, n: mine.length, speech, planned, head, verdict,
           rebuild: s.composition?.rebuild };
});

// Adjacent short/long pairs can be fixed by moving the cut instead of changing runtime.
for (let i = 0; i < rows.length - 1; i++) {
  const A = rows[i], B = rows[i + 1];
  const needy = (r) => r.verdict === 'EXTEND' || r.verdict === 'RETHINK';
  if (needy(A) && B.verdict === 'SHORTEN' && B.head + A.head > TIGHT * 2) {
    A.shift = `← borrow from ${B.id}`; B.shift = `→ lend to ${A.id}`;
    A.verdict = B.verdict = 'SHIFT_BOUNDARY';
  } else if (needy(B) && A.verdict === 'SHORTEN' && A.head + B.head > TIGHT * 2) {
    B.shift = `← borrow from ${A.id}`; A.shift = `→ lend to ${B.id}`;
    A.verdict = B.verdict = 'SHIFT_BOUNDARY';
  }
}

const C = { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cyn: '\x1b[36m', b: '\x1b[1m', x: '\x1b[0m' };
const colour = { KEEP: C.grn, EXTEND: C.yel, SHORTEN: C.yel, SHIFT_BOUNDARY: C.cyn, RETHINK: C.red };

const speechTotal = Number(rows.reduce((t, r) => t + r.speech, 0).toFixed(2));
const plannedTotal = rows.reduce((t, r) => t + r.planned, 0);

console.log(`\n${C.b}${id}${C.x} — narration measured, not estimated`);
console.log(`  audio ${prov.audio_duration}s over ${segs.length} segments  ${C.dim}(package estimated ${prov.package_estimate_sec}s)${C.x}`);
console.log(`  planned runtime ${plannedTotal}s · speech ${speechTotal}s · total headroom ${(plannedTotal - speechTotal).toFixed(2)}s\n`);
console.log(`  ${'shot'.padEnd(18)} ${'seg'.padEnd(6)} ${'speech'.padStart(7)} ${'planned'.padStart(8)} ${'head'.padStart(7)}   verdict`);
for (const r of rows) {
  console.log(`  ${r.id.padEnd(18)} ${r.segs.padEnd(6)} ${String(r.speech).padStart(7)} ${String(r.planned).padStart(8)} `
    + `${String(r.head).padStart(7)}   ${colour[r.verdict]}${r.verdict}${C.x}`
    + (r.shift ? `  ${C.dim}${r.shift}${C.x}` : '')
    + (r.rebuild === false ? `  ${C.dim}(composition kept)${C.x}` : ''));
}
const tally = rows.reduce((m, r) => (m[r.verdict] = (m[r.verdict] || 0) + 1, m), {});
console.log(`\n  ${Object.entries(tally).map(([k, n]) => `${k} ${n}`).join(' · ')}\n`);

fs.writeFileSync(path.join(vdir, 'TIMING_REPORT.yaml'), YAML.stringify({
  measured_audio_duration: prov.audio_duration,
  package_estimate: prov.package_estimate_sec,
  planned_runtime: plannedTotal,
  speech_total: speechTotal,
  total_headroom: Number((plannedTotal - speechTotal).toFixed(2)),
  bands: { tight_below: TIGHT, loose_above: LOOSE },
  shots: rows,
}));
console.log(`  ${C.dim}wrote videos/${id}/TIMING_REPORT.yaml${C.x}\n`);
