#!/usr/bin/env node
/**
 * cv — the creative-video runtime CLI.
 *
 * Every command is deterministic, takes explicit paths, and prints machine-readable
 * output on request. No editor UI, no interactive state. This is the surface an AI
 * visual director actually drives.
 *
 *   cv import  <pkg> --as <video-id>  ingest a Content Package + freeze provenance
 *   cv voice inspect   <video-id>  narration + provider state (never writes)
 *   cv voice generate  <video-id>  narration -> VoiceProvider -> audio + provenance
 *   cv voice timing    <video-id>  measured narration vs planned shot durations
 *   cv provenance [video-id]       snapshot vs current source: CURRENT / CHANGED / UNAVAILABLE
 *   cv sem     <video>              replay the semantic model, prove the mechanism
 *   cv assert  <video> [shot]       compile semantics -> *.motion.json + marker brief
 *   cv gate    <video> [shot]       hyperframes check (lint+runtime+layout+motion+contrast)
 *   cv snap    <video> [shot]       hero-frame snapshots + per-shot contact sheet
 *   cv onion   <video> <shot> <sel> onion-skin motion diagnostic for one element
 *   cv sheet   <video>              cross-shot contact sheet (variety review)
 *   cv ab      <video> <a> <b>      A/B two shots at identical timestamps
 *   cv gallery                      every shot of every video, tiled
 *   cv variety <video>              blur/silhouette similarity matrix (diagnostic only)
 *   cv render  <video> [shot]       render shot(s) to mp4
 *   cv compose <video>              concat rendered shots -> final.mp4
 *   cv fingerprint <video>          write the creative-memory fingerprint
 *   cv recall  [n]                  read recent fingerprints before designing
 */

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { simulate, checkExpectations, eventId } from '../semantic/lib/simulate.mjs';
import { compileAssertions, markerBrief } from '../semantic/lib/compile-assertions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HF = path.join(ROOT, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');

// ---------------------------------------------------------------- helpers ----
const C = { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cyn: '\x1b[36m', b: '\x1b[1m', x: '\x1b[0m' };
const say = (...a) => console.log(...a);
const die = (m) => { console.error(`${C.red}error${C.x} ${m}`); process.exit(1); };
const readYaml = (p) => YAML.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

function videoDir(id) {
  const d = path.join(ROOT, 'videos', id);
  if (!exists(d)) die(`no video "${id}" — expected ${d}`);
  return d;
}
function loadVideo(id) {
  const dir = videoDir(id);
  const planPath = path.join(dir, 'shot_plan.yaml');
  const semPath = path.join(dir, 'semantics.yaml');
  if (!exists(semPath)) die(`missing ${semPath}`);
  const model = readYaml(semPath);
  const plan = exists(planPath) ? readYaml(planPath) : null;
  return { id, dir, model, plan, semPath, planPath };
}
function scenarioOf(model, name) {
  const scenarios = model.scenarios || { default: { events: model.events, invariants: model.invariants, expect: model.expect } };
  const s = scenarios[name || Object.keys(scenarios)[0]];
  if (!s) die(`unknown scenario "${name}" (have: ${Object.keys(scenarios).join(', ')})`);
  return s;
}
function shotsOf(plan, only) {
  if (!plan) die('no shot_plan.yaml');
  const list = plan.shots || [];
  return only ? list.filter((s) => s.id === only || s.id.endsWith(only)) : list;
}
function shotDir(v, shot) { return path.join(v.dir, 'shots', shot.id); }

// windowsHide here only hides THIS node process. The browser is spawned further down by
// @puppeteer/browsers, and chrome-headless-shell.exe is a console-subsystem binary, so
// it and its children each get a console window. The preload forces windowsHide on every
// spawn inside the child process. See tools/no-console-window.cjs.
const NO_WINDOW = path.join(ROOT, 'tools', 'no-console-window.cjs');

function hf(args, opts = {}) {
  const r = spawnSync(process.execPath, ['--require', NO_WINDOW, HF, ...args], {
    encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true, ...opts,
  });
  return { code: r.status, out: (r.stdout || ''), err: (r.stderr || '') };
}
function stripAnsi(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }
function jsonFromHf(out) {
  const clean = stripAnsi(out);
  const i = clean.indexOf('{');
  const j = clean.lastIndexOf('}');
  if (i < 0 || j < 0) return null;
  try { return JSON.parse(clean.slice(i, j + 1)); } catch { return null; }
}
// drawtext has no fontconfig on this platform, so every label passes an explicit
// fontfile. Running with cwd=FONTDIR keeps a Windows drive colon out of the
// filtergraph, where it would have to be escaped.
// Codes whose measurements are unreliable for rotated SVG groups. NOT suppressed —
// annotated, so the noise is explained rather than hidden. Evidence in VALIDATION_NOTES.md.
const ROTATED_BBOX = /^(container_overflow|escaped_container)$/;

const FONTDIR = path.join(ROOT, 'brand', 'fonts');
const SHEET_FONT = 'IBMPlexSansCondensed-600.ttf';

function ff(args, cwd) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args],
    { encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true, ...(cwd ? { cwd } : {}) });
  if (r.status !== 0) die(`ffmpeg failed:\n${r.stderr}`);
  return r;
}

// -------------------------------------------------------------------- sem ----
function cmdSem(id, opts) {
  const v = loadVideo(id);
  const scenarios = v.model.scenarios || { default: { events: v.model.events, invariants: v.model.invariants, expect: v.model.expect } };
  let failed = 0;
  const report = {};

  for (const [name, sc] of Object.entries(scenarios)) {
    const res = simulate(v.model, sc);
    const errs = checkExpectations(res, sc);
    report[name] = { ...res, errors: errs };
    if (errs.length) failed++;

    if (opts.json) continue;
    say(`\n${C.b}scenario: ${name}${C.x}${sc.note ? `  ${C.dim}${sc.note}${C.x}` : ''}`);
    say(`${C.dim}  trace${C.x}`);
    for (const r of res.trace) {
      const bits = [];
      if (r.field) bits.push(`${r.field}${r.value !== undefined ? `=${r.value}` : ''}${r.version !== undefined ? ` v${r.version}` : ''}`);
      if (r.resource) bits.push(`${r.resource}${r.blocked ? ` BLOCKED by ${r.blockedBy}` : r.holder ? ` held by ${r.holder}` : ' free'}`);
      if (r.queue) bits.push(`${r.queue} depth=${r.depth}`);
      if (r.count !== undefined) bits.push(`×${r.count}${r.of ? ` ${r.of}` : ''}`);
      if (r.pass !== undefined) bits.push(r.pass ? 'PASS' : 'DENY');
      say(`    ${String(r.t).padStart(5)}  ${r.actor.padEnd(10)} ${r.op.padEnd(8)} ${bits.join('  ')}${r.stale ? `  ${C.yel}<- based on a stale read${C.x}` : ''}`);
    }
    say(`${C.dim}  final${C.x}  ${JSON.stringify(res.derived.finalState)}${Object.keys(res.derived.queues).length ? `  queues=${JSON.stringify(res.derived.queues)}` : ''}`);
    if (res.derived.lostWrites.length) {
      for (const w of res.derived.lostWrites) {
        say(`  ${C.yel}lost write${C.x}  ${w.lostActor}'s ${w.field}=${w.lostValue} overwritten by ${w.overwriterActor}`);
      }
    }
    if (res.derived.overlaps.length) {
      for (const o of res.derived.overlaps) say(`  ${C.yel}overlap${C.x}  ${o.a} & ${o.b} hold concurrent open reads of ${o.field}`);
    }
    say(`${C.dim}  invariants${C.x}`);
    for (const i of res.invariants) {
      const claimed = (sc.expect?.violations || []).includes(i.id);
      const tag = i.holds ? `${C.grn}holds${C.x}` : claimed ? `${C.yel}violated (as the story claims)${C.x}` : `${C.red}violated${C.x}`;
      say(`    ${i.id.padEnd(24)} ${tag}  ${C.dim}${i.detail}${C.x}`);
    }
    if (errs.length) for (const e of errs) say(`  ${C.red}✗${C.x} ${e}`);
    else say(`  ${C.grn}✓${C.x} replay matches the story's claims`);
  }

  if (opts.json) say(JSON.stringify(report, null, 2));
  if (failed) process.exit(1);
}

// ----------------------------------------------------------------- assert ----
function cmdAssert(id, only, opts) {
  const v = loadVideo(id);
  // Only shots that will actually face the motion gate get a sidecar.
  const shots = shotsOf(v.plan, only)
    .filter((s) => (s.engine || 'hyperframes') === 'hyperframes' && s.status !== 'planned');
  if (!shots.length) die(`no gateable shots matched${only ? ` "${only}"` : ''}`);
  for (const shot of shots) {
    // `semantic_truth` is the Step-4 field name; `semantic` was the earlier one.
    // Normalise here, because falling through to "all events in the scenario" is a
    // silent wrong answer rather than an error.
    if (!shot.semantic && shot.semantic_truth) shot.semantic = shot.semantic_truth;
    const sc = scenarioOf(v.model, shot.semantic?.scenario);
    const { spec, meta } = compileAssertions({ model: v.model, scenario: sc, shot, tolerance: opts.tolerance });
    const dir = shotDir(v, shot);
    fs.mkdirSync(dir, { recursive: true });
    // A shot with nothing to assert must produce NO sidecar, not an empty one. An empty
    // spec fails the motion gate as `motion_spec_invalid: spec has no assertions`, which
    // turns "there is no runtime event in this shot" into an error. F01 hit this on eight
    // shots at once: most of its shots are authoring-register or statement shots and have
    // no runtime moment to mark, and instrumenting them anyway would produce exactly the
    // vacuous assertions E01 taught us to refuse.
    const specPath = path.join(dir, 'index.motion.json');
    if (!spec.assertions.length) {
      if (exists(specPath)) fs.unlinkSync(specPath);
      fs.writeFileSync(path.join(dir, 'MARKERS.txt'), markerBrief(meta) + '\n');
      say(`${C.dim}—${C.x} ${shot.id}  nothing to assert — no sidecar written`);
      continue;
    }
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'MARKERS.txt'), markerBrief(meta) + '\n');
    say(`${C.grn}✓${C.x} ${shot.id}  ${spec.assertions.length} assertions, ${meta.eventCount} markers  ${C.dim}${path.relative(ROOT, dir)}${C.x}`);
    if (opts.verbose) say(markerBrief(meta).split('\n').map((l) => '    ' + l).join('\n'));
  }
}

// ------------------------------------------------------------------- gate ----
function cmdGate(id, only, opts) {
  const v = loadVideo(id);
  const shots = shotsOf(v.plan, only).filter((s) => (s.engine || "hyperframes") === "hyperframes" && s.status !== "planned");
  let bad = 0;
  const summary = [];
  for (const shot of shots) {
    const dir = shotDir(v, shot);
    if (!exists(path.join(dir, 'index.html'))) { say(`${C.dim}—${C.x} ${shot.id}  not authored yet`); continue; }

    // The plan owns the duration; the composition must agree. Nothing else catches
    // this: the motion sidecar's assertions can all pass inside a composition that
    // is shorter than planned, and the closing beat just gets cut off mid-fade.
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    const declared = Number(html.match(/data-composition-id[^>]*?data-duration="([\d.]+)"/s)?.[1]
      ?? html.match(/data-duration="([\d.]+)"/)?.[1]);
    if (Number.isFinite(declared) && Math.abs(declared - shot.duration) > 0.001) {
      say(`${C.red}✗${C.x} ${shot.id}  duration mismatch: shot_plan says ${shot.duration}s, composition declares ${declared}s`);
      say(`    ${C.dim}fix: set data-duration on #root and the stage clip to ${shot.duration}${C.x}`);
      bad++;
      continue;
    }

    // An undeclared camera is not "static" — it is nobody having decided. Static is
    // a legitimate answer (a comparison needs a fixed frame; a reader needs a still
    // one) but it has to be an answer.
    // A superseded original is a record of the A/B, not a deliverable, so it is not
    // asked to justify a camera it was replaced for not having.
    if (!shot.camera && shot.status !== 'superseded') {
      say(`${C.yel}?${C.x} ${shot.id}  no camera declared — static by default, not by decision`);
    }

    // Static pre-check. --ink-ghost is 1.8:1 and structural-only; it has been put on
    // text four times now, and the runtime contrast pass only catches it if a snapshot
    // happens to land while it is on screen — a 0.35s colour tween can slip through
    // entirely. Cheap grep, caught before anything renders.
    //
    // Both spellings, because the fourth occurrence was `color: '#3A3E42'` inside a
    // GSAP tween and the property-name grep could not see it. Anything after
    // @brand:end is application code; the token definition itself is legitimate.
    const brandEnd = html.indexOf('@brand:end');
    const ghost = /color:\s*(?:var\(--ink-ghost\)|['"]?#3A3E42)/gi;
    for (const m of html.matchAll(ghost)) {
      if (m.index < brandEnd) continue;
      const line = html.slice(0, m.index).split('\n').length;
      say(`${C.yel}?${C.x} ${shot.id}  --ink-ghost as text colour at line ${line} — 1.8:1, structural token only`);
    }

    // The gate samples the final held state already — measured: for a 13s shot the
    // sample list ends at t=13. What it will not do is call a 2px intersection an
    // overlap, because layout tolerance is 2px and a lower tolerance would fire on
    // every legitimate optical adjustment in the library. p7-detection shipped clean
    // with two text blocks 2px apart, and it was the CONTACT SHEET that caught it.
    //
    // So the check is not 'detect it' but 'guarantee somebody looks where it lives':
    // held-layout defects only exist after everything has settled, which is exactly the
    // moment a hero_frames list tends to omit. See tests/held-overlap.test.mjs.
    const hero = shot.review?.hero_frames;
    if (Array.isArray(hero) && shot.duration && !hero.some((t) => shot.duration - t <= 0.6)) {
      say(`${C.yel}?${C.x} ${shot.id}  no hero frame within 0.6s of the end — the final held state is`
        + ` where layout defects survive the gate`);
    }
    const args = ['check', dir, '--json', '--no-browser-gpu', '--at-transitions'];
    if (shot.validation?.caption_zone) args.push('--caption-zone', shot.validation.caption_zone === true ? 'x0=0;y0=.82;x1=1;y1=1;severity=warning' : shot.validation.caption_zone);
    if (opts.snapshots) args.push('--snapshots');
    const { out } = hf(args);
    const j = jsonFromHf(out);
    if (!j) { say(`${C.red}✗${C.x} ${shot.id}  check produced no JSON`); bad++; continue; }
    const sections = ['lint', 'runtime', 'layout', 'motion', 'contrast'];
    const errs = [];
    for (const s of sections) for (const f of j[s]?.findings || []) if (f.severity === 'error') errs.push({ section: s, ...f });
    const warns = sections.flatMap((s) => (j[s]?.findings || []).filter((f) => f.severity === 'warning').map((f) => ({ section: s, ...f })));
    summary.push({ shot: shot.id, ok: j.ok, errors: errs.length, warnings: warns.length, findings: [...errs, ...warns] });
    if (errs.length) {
      bad++;
      say(`${C.red}✗${C.x} ${shot.id}  ${errs.length} error(s)`);
      for (const e of errs) say(`    ${C.red}${e.section}/${e.code}${C.x} ${e.selector || ''} ${e.message}${e.fixHint ? `\n      ${C.dim}fix: ${e.fixHint}${C.x}` : ''}`);
    } else {
      say(`${C.grn}✓${C.x} ${shot.id}  clean${warns.length ? `  ${C.yel}(${warns.length} warning)${C.x}` : ''}`);
    }
    // Warnings repeat per sampled frame, so one geometric fact can produce thirty
    // lines and bury the one that matters. Group by code+selector and report counts.
    if (warns.length) {
      const groups = new Map();
      for (const w of warns) {
        const k = `${w.section}/${w.code}|${w.selector || ''}`;
        const g = groups.get(k) || { ...w, n: 0 };
        g.n++; groups.set(k, g);
      }
      for (const g of groups.values()) {
        const rot = ROTATED_BBOX.test(g.code) ? `  ${C.dim}(rotated-group bbox: measured box is the unrotated box rotated, not the real geometry — see VALIDATION_NOTES.md)${C.x}` : '';
        if (opts.verbose || rot) {
          say(`    ${C.yel}${g.section}/${g.code}${C.x} ${g.selector || ''} ×${g.n}${rot}`);
        }
      }
    }
  }
  if (opts.json) say(JSON.stringify(summary, null, 2));
  if (bad) process.exit(1);
}

// ------------------------------------------------------------------- snap ----
function cmdSnap(id, only, opts) {
  const v = loadVideo(id);
  const shots = shotsOf(v.plan, only).filter((s) => (s.engine || "hyperframes") === "hyperframes" && s.status !== "planned");
  for (const shot of shots) {
    const dir = shotDir(v, shot);
    if (!exists(path.join(dir, 'index.html'))) { say(`${C.dim}—${C.x} ${shot.id} not authored`); continue; }
    const at = opts.at || (shot.review?.hero_frames || []).join(',');
    const args = ['snapshot', dir, '--no-browser-gpu', '--describe', 'false'];
    if (at) args.push('--at', String(at), '--no-end'); else args.push('--frames', String(opts.frames || 5));
    const { out, code } = hf(args);
    const files = stripAnsi(out).split('\n').filter((l) => /\.(png|jpg)/.test(l)).map((l) => l.trim());
    say(`${code === 0 ? C.grn + '✓' + C.x : C.red + '✗' + C.x} ${shot.id}  ${files.length} frames  ${C.dim}${path.relative(ROOT, path.join(dir, 'snapshots'))}${C.x}`);
  }
}

function cmdOnion(id, only, selector, opts) {
  const v = loadVideo(id);
  const shot = shotsOf(v.plan, only)[0];
  if (!shot) die(`no shot "${only}"`);
  const dir = shotDir(v, shot);
  const out = path.join(dir, 'snapshots', `onion${selector.replace(/[^A-Za-z0-9]/g, '')}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const args = ['keyframes', dir, '--shot', out, '--selector', selector, '--samples', String(opts.samples || 9), '--layout', opts.layout || 'path'];
  const r = hf(args);
  say(stripAnsi(r.out).split('\n').filter(Boolean).slice(-8).join('\n'));
  say(`${C.grn}✓${C.x} ${path.relative(ROOT, out)}`);
}

// ------------------------------------------------------- cross-shot sheet ----
/** One representative frame per shot, tiled. The variety review surface. */
function heroFrames(v, shots) {
  const picks = [];
  for (const shot of shots) {
    const snapDir = path.join(shotDir(v, shot), 'snapshots');
    if (!exists(snapDir)) continue;
    const pngs = fs.readdirSync(snapDir).filter((f) => f.endsWith('.png') && f.startsWith('frame-')).sort();
    if (!pngs.length) continue;
    // middle frame is the most representative of the shot's structure
    picks.push({ shot: shot.id, file: path.join(snapDir, pngs[Math.floor(pngs.length / 2)]) });
  }
  return picks;
}

function tile(picks, out, cols = 4) {
  const n = picks.length;
  const c = Math.min(n, cols);
  const inputs = picks.flatMap((p) => ['-i', p.file]);
  const labels = picks.map((p, i) =>
    `[${i}:v]scale=270:480,drawbox=x=0:y=0:w=iw:h=28:color=0x0C0D0F@0.85:t=fill,` +
    `drawtext=fontfile=${SHEET_FONT}:text='${p.shot.replace(/[:'\\]/g, '')}':x=9:y=6:` +
    `fontsize=15:fontcolor=0xEDEAE4[v${i}]`).join(';');
  const stack = picks.map((_, i) => `[v${i}]`).join('') +
    `xstack=inputs=${n}:layout=${xstackLayout(n, c)}:fill=0x1A1A1A[out]`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  ff([...inputs, '-filter_complex', `${labels};${stack}`, '-map', '[out]', '-frames:v', '1', '-q:v', '3', out], FONTDIR);
  return { cols: c, rows: Math.ceil(n / c) };
}

function cmdSheet(id) {
  const v = loadVideo(id);
  const picks = heroFrames(v, shotsOf(v.plan));
  if (!picks.length) die('no snapshots yet — run `cv snap` first');
  const out = path.join(v.dir, 'review', 'contact-sheet.jpg');
  const { cols, rows } = tile(picks, out);
  say(`${C.grn}✓${C.x} ${picks.length} shots (${cols}×${rows})  ${C.dim}${path.relative(ROOT, out)}${C.x}`);
}

/**
 * A/B a shot against a variant: row one is the baseline, row two the experiment,
 * both sampled at the SAME times. Nothing else makes "did this actually help?"
 * answerable — two contact sheets at different timestamps are not a comparison.
 */
function cmdAb(id, a, b) {
  const v = loadVideo(id);
  const shots = shotsOf(v.plan);
  const pick = (sid) => {
    const shot = shots.find((s) => s.id === sid);
    if (!shot) die(`no shot "${sid}"`);
    const dir = path.join(shotDir(v, shot), 'snapshots');
    if (!exists(dir)) die(`${sid} has no snapshots — run \`cv snap ${id} ${sid} --at ...\` first`);
    return fs.readdirSync(dir).filter((f) => /^frame-\d+-at-/.test(f)).sort()
      .map((f) => ({ shot: sid, file: path.join(dir, f), t: f.match(/at-([\d.]+)s/)?.[1] }));
  };
  const A = pick(a), B = pick(b);
  const n = Math.min(A.length, B.length);
  if (!n) die('no comparable frames');
  const rowA = A.slice(0, n), rowB = B.slice(0, n);
  const missA = rowA.filter((x, i) => x.t !== rowB[i].t);
  if (missA.length) say(`${C.yel}warning${C.x} frame times differ — snapshot both with the same --at for a real comparison`);

  const picks = [...rowA.map((x) => ({ ...x, shot: `${a}  ${x.t}s` })),
                 ...rowB.map((x) => ({ ...x, shot: `${b}  ${x.t}s` }))];
  const out = path.join(v.dir, 'review', `ab-${a}-vs-${b}.jpg`);
  tile(picks, out, n);
  say(`${C.grn}✓${C.x} ${a} (top) vs ${b} (bottom), ${n} matched frames  ${C.dim}${path.relative(ROOT, out)}${C.x}`);
}

/**
 * The variety surface that actually matters: every authored shot from every video,
 * side by side. One brand universe, no two frames alike — or the thesis has failed.
 */
function cmdGallery() {
  const dir = path.join(ROOT, 'videos');
  const picks = [];
  for (const id of fs.readdirSync(dir).filter((d) => !d.startsWith('_') && !d.startsWith('.'))) {
    if (!exists(path.join(dir, id, 'semantics.yaml'))) continue;
    const v = loadVideo(id);
    if (!v.plan) continue;
    for (const p of heroFrames(v, shotsOf(v.plan))) picks.push({ shot: `${id.split('-')[0]} ${p.shot}`, file: p.file });
  }
  if (!picks.length) die('no snapshots anywhere — run `cv snap` first');
  const out = path.join(ROOT, 'creative_memory', 'gallery.jpg');
  const { cols, rows } = tile(picks, out, 5);
  say(`${C.grn}✓${C.x} ${picks.length} shots across all videos (${cols}×${rows})  ${C.dim}${path.relative(ROOT, out)}${C.x}`);
}
function xstackLayout(n, cols) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    parts.push(`${c === 0 ? '0' : Array.from({ length: c }, (_, k) => `w${k}`).join('+')}_${r === 0 ? '0' : Array.from({ length: r }, (_, k) => `h${k * cols}`).join('+')}`);
  }
  return parts.join('|');
}

// ---------------------------------------------------------------- variety ----
/**
 * Blur/silhouette similarity. DIAGNOSTIC ONLY — high similarity is a prompt to
 * ask "is this repetition semantically earned?", never an instruction to redesign.
 */
function cmdVariety(id) {
  const v = loadVideo(id);
  const picks = heroFrames(v, shotsOf(v.plan));
  if (picks.length < 2) die('need at least 2 snapshotted shots');
  const tmp = path.join(v.dir, 'review', '.sig');
  fs.mkdirSync(tmp, { recursive: true });
  const sigs = picks.map((p, i) => {
    const o = path.join(tmp, `s${i}.pgm`);
    // grayscale silhouette with all detail destroyed
    ff(['-i', p.file, '-vf', 'format=gray,scale=10:18', '-frames:v', '1', o]);
    const buf = fs.readFileSync(o);
    const hdrEnd = findPgmData(buf);
    return { shot: p.shot, px: normalise([...buf.subarray(hdrEnd)]) };
  });
  say(`${C.b}silhouette distance${C.x} ${C.dim}(0 = identical structure, 1 = maximally different)${C.x}\n`);
  const w = Math.max(...sigs.map((s) => s.shot.length));
  say(' '.repeat(w + 2) + sigs.map((s) => s.shot.slice(-3).padStart(5)).join(''));
  const flags = [];
  for (let i = 0; i < sigs.length; i++) {
    let row = '  ' + sigs[i].shot.padEnd(w);
    for (let j = 0; j < sigs.length; j++) {
      if (i === j) { row += '    ·'; continue; }
      const d = dist(sigs[i].px, sigs[j].px);
      const col = d < 0.12 ? C.red : d < 0.30 ? C.yel : C.dim;
      row += `${col}${d.toFixed(2).padStart(5)}${C.x}`;
      if (i < j && d < 0.12) flags.push([sigs[i].shot, sigs[j].shot, d]);
    }
    say(row);
  }
  if (flags.length) {
    say(`\n${C.yel}near-identical silhouettes${C.x} — check each: earned comparison, or template habit?`);
    for (const [a, b, d] of flags) say(`  ${a} ↔ ${b}  (${d.toFixed(3)})`);
  } else say(`\n${C.grn}✓${C.x} no two shots share a silhouette`);
}
function findPgmData(buf) {
  let seen = 0, i = 0;
  while (i < buf.length && seen < 4) { // P5 \n w h \n max \n
    if (buf[i] === 0x0a || buf[i] === 0x20) seen++;
    i++;
  }
  return i;
}
/**
 * Mean-centre and scale each signature to unit norm BEFORE comparing.
 *
 * The naive version (raw absolute grey levels, L1) reported every pair of shots in
 * this brand as 0.00-0.01 apart — because a near-black frame with sparse light type
 * averages to almost nothing at 10x18, so it was measuring average exposure, not
 * structure. Normalising makes the comparison about WHERE the light is.
 */
function normalise(px) {
  const mean = px.reduce((a, b) => a + b, 0) / px.length;
  const centred = px.map((v) => v - mean);
  const norm = Math.sqrt(centred.reduce((a, b) => a + b * b, 0)) || 1;
  return centred.map((v) => v / norm);
}

/** cosine distance on normalised signatures: 0 = same structure, 1 = unrelated. */
function dist(a, b) {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, 1 - dot));
}

// ----------------------------------------------------------------- render ----
function cmdRender(id, only, opts) {
  const v = loadVideo(id);
  const shots = shotsOf(v.plan, only).filter((s) => s.status !== "planned");
  for (const shot of shots) {
    const dir = shotDir(v, shot);
    const engine = shot.engine || 'hyperframes';
    const out = path.join(dir, 'render.mp4');
    if (engine === 'hyperframes') {
      if (!exists(path.join(dir, 'index.html'))) { say(`${C.dim}—${C.x} ${shot.id} not authored`); continue; }
      const t0 = Date.now();
      const args = ['render', dir, '-o', out, '--no-browser-gpu'];
      if (opts.draft) args.push('--fps', '15');
      const r = hf(args);
      if (r.code !== 0) { say(`${C.red}✗${C.x} ${shot.id}\n${stripAnsi(r.err || r.out).split('\n').slice(-12).join('\n')}`); continue; }
      say(`${C.grn}✓${C.x} ${shot.id}  ${probe(out)}  ${C.dim}${((Date.now() - t0) / 1000).toFixed(0)}s${C.x}`);
    } else if (engine === 'ffmpeg') {
      const script = path.join(dir, 'build.mjs');
      if (!exists(script)) { say(`${C.dim}—${C.x} ${shot.id} no build.mjs`); continue; }
      const r = spawnSync(process.execPath, [script, out], { encoding: 'utf8', stdio: 'inherit', windowsHide: true });
      if (r.status !== 0) { say(`${C.red}✗${C.x} ${shot.id} build.mjs failed`); continue; }
      say(`${C.grn}✓${C.x} ${shot.id}  ${probe(out)}  ${C.dim}engine=ffmpeg${C.x}`);
    } else {
      say(`${C.yel}?${C.x} ${shot.id} engine "${engine}" has no adapter yet`);
    }
  }
}
function probe(f) {
  if (!exists(f)) return 'missing';
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,nb_frames', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f], { encoding: 'utf8', windowsHide: true });
  const [w, h, nb, dur] = r.stdout.trim().split('\n');
  return `${w}×${h} ${Number(dur).toFixed(2)}s ${nb}f`;
}

// ---------------------------------------------------------------- compose ----
function cmdCompose(id) {
  const v = loadVideo(id);
  // Only shots with no `status` are in the cut: planned, experiment,
  // experiment_rejected and superseded are all records rather than deliverables.
  // Order comes from `time`, not from position in the file, so a chosen variant
  // can live at the end of shot_plan.yaml and still cut in the right place.
  const shots = shotsOf(v.plan)
    .filter((s) => !s.status)
    .sort((a, b) => (a.time?.[0] ?? 0) - (b.time?.[0] ?? 0));
  const parts = [];
  for (const shot of shots) {
    const f = path.join(shotDir(v, shot), 'render.mp4');
    if (!exists(f)) { say(`${C.yel}skip${C.x} ${shot.id} (not rendered)`); continue; }
    parts.push(f);
  }
  if (!parts.length) die('nothing rendered yet');
  const outDir = path.join(v.dir, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const listFile = path.join(outDir, 'concat.txt');
  fs.writeFileSync(listFile, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n') + '\n');

  // A filename creates a state of mind. "final.mp4" tells whoever opens the folder —
  // including a future agent — that the visual story is done. It is only allowed to
  // say that when every shot the story needs has actually shipped; otherwise the name
  // states the ratio and stays honest about it.
  const needed = shotsOf(v.plan).filter((s) => !s.status || s.status === 'planned').length;
  const done = parts.length;

  // A shot plan that has not reached production cannot produce a "final" or even a
  // "prototype N of M" — during hero exploration M is not known yet. The plan says
  // what stage it is at, and the filename says the same thing.
  //
  // "Every shot rendered" is NOT the same as "the video works". The first cut of this
  // video rendered 8/8 and was immediately named final.mp4, before anyone had watched
  // it end to end — which is exactly the false completion the naming rule exists to
  // prevent. So the plan has to assert `full_video_review: passed` as a separate act,
  // and rendering everything can no longer produce that name on its own.
  const stage = v.plan.stage;
  const reviewed = v.plan.full_video_review === 'passed';
  // A full-video review of a narrated video watched in silence is not a review of that
  // video: it cannot see whether a beat lands on the word it belongs to. Once a narration
  // track exists, composing without it stops being an option this command offers.
  const voiceTrack = path.join(v.dir, 'voice', 'narration_timed.wav');
  const voiced = exists(voiceTrack);

  // A video that HAS a narration cannot be composed silent by accident. Before this, a
  // missing track just took the silent branch and produced a normal-looking mp4 — which is
  // what happened the moment build-track started refusing to write one.
  const voiceProv = path.join(v.dir, 'VOICE_PROVENANCE.yaml');
  if (exists(voiceProv) && !voiced) {
    die('this video has narration but no voice/narration_timed.wav.\n'
      + '  Composing silent would produce a file that looks finished and is not.\n'
      + '  Run tools/voice/build-track.mjs — and if it refuses, the shot timings no longer\n'
      + '  fit the narration, which is the thing to fix rather than route around.');
  }
  if (voiced && exists(voiceProv)) {
    // Length cannot distinguish two tracks: build-track always produces exactly the planned
    // runtime. The hash of the source audio can.
    const stamp = JSON.parse(fs.readFileSync(path.join(v.dir, 'voice', 'shot_timing.json'), 'utf8'));
    const prov = YAML.parse(fs.readFileSync(voiceProv, 'utf8'));
    if (stamp.built_from_audio_sha256 !== prov.audio_sha256) {
      die('voice/narration_timed.wav was built from different audio than the current narration.\n'
        + `  track built from : ${String(stamp.built_from_audio_sha256).slice(0, 16)}…\n`
        + `  narration now    : ${String(prov.audio_sha256).slice(0, 16)}…\n`
        + '  Rebuild the track. Both files are the planned runtime, so nothing downstream\n'
        + '  would have noticed the swap.');
    }
  }

  let name;
  if (stage && stage !== 'production') name = `${stage}.mp4`;
  else if (done === needed && reviewed) name = 'final.mp4';
  else name = `prototype_${done}of${needed}${voiced ? '_voiced' : ''}.mp4`;
  const out = path.join(outDir, name);

  if (stage && stage !== 'production') say(`${C.dim}stage: ${stage} — not a cut of the video${C.x}`);
  else if (done !== needed) say(`${C.dim}not final: ${needed - done} shot(s) the story needs are still planned${C.x}`);
  else if (!reviewed) say(`${C.dim}not final: all ${done} shots rendered, but full_video_review is not "passed" in the plan${C.x}`);
  // Per-shot renders already share codec/size/fps, so concat is lossless.
  if (voiced) {
    // The track is built from the shot durations, so a mismatch means plan and audio have
    // drifted apart — and every beat after the drift point would be wrong while still
    // looking correct frame by frame. Refuse rather than ship a silent desync.
    const vDur = parts.reduce((a, f) => a + secondsOf(f), 0);
    const aDur = secondsOf(voiceTrack);
    if (Math.abs(vDur - aDur) > 0.05) {
      die('voice track is ' + aDur.toFixed(3) + 's but the ' + parts.length + ' shots run '
        + vDur.toFixed(3) + 's — rebuild it (tools/voice/build-track.mjs) before composing');
    }
    ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-i', voiceTrack,
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
  } else {
    ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', out]);
  }
  say(`${C.grn}✓${C.x} ${parts.length} shots → ${path.relative(ROOT, out)}  ${probe(out)}`);
}

function secondsOf(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8', windowsHide: true });
  const n = parseFloat((r.stdout || '').trim());
  if (!Number.isFinite(n)) die('ffprobe could not read a duration from ' + file);
  return n;
}

// ------------------------------------------------------------ fingerprint ----
function cmdFingerprint(id) {
  const v = loadVideo(id);
  const fp = v.plan?.fingerprint;
  if (!fp) die('shot_plan.yaml has no `fingerprint:` block — the director must author it');
  // Memory records what SHIPPED. A superseded static original, a planned shot and a
  // rejected experiment are all records elsewhere; putting them here would teach the
  // next video habits this one did not actually have.
  const shots = shotsOf(v.plan).filter((s) => !s.status);

  // Camera is recorded as a REASON, not as a primitive. "push_in" tells the next
  // video nothing worth knowing; "global_to_root_cause" tells it which visual
  // argument has already been used. A motion repeated for a different reason is
  // fine; the same reason repeated is the habit.
  const camera = [];
  for (const s of shots) {
    const c = s.camera;
    camera.push({
      shot: s.id,
      motion: c?.motion || 'static',
      semantic_function: c?.semantic_function || 'UNDECLARED',
    });
  }
  const undeclared = camera.filter((c) => c.semantic_function === 'UNDECLARED');

  // A frozen video's memory has to carry the freeze and the open traps, not just the
  // devices. `cv recall` is what gets read before the next video is designed, and a
  // record of only what worked will re-make what did not.
  const out = {
    video_id: id,
    status: v.plan.status || 'active',
    title: v.model.title,
    domain: v.model.domain,
    shots: shots.length,
    engines: [...new Set(shots.map((s) => s.engine || 'hyperframes'))],
    representation_layers: [...new Set(shots.flatMap((s) => s.representation || []))],
    camera,
    ...fp,
    ...(v.plan.known_limitations ? { known_limitations: v.plan.known_limitations } : {}),
  };
  delete out.camera_devices;   // superseded by `camera` — motion alone is not memory
  if (undeclared.length) {
    say(`${C.yel}warning${C.x} ${undeclared.length} shot(s) have no declared camera reason: ` +
      `${undeclared.map((c) => c.shot).join(', ')}`);
    say(`  ${C.dim}an undeclared camera is a default, not a decision. Add camera.semantic_function` +
      ` — "static" is a valid answer when it has a reason.${C.x}`);
  }
  const dest = path.join(ROOT, 'creative_memory', `${id}.yaml`);
  fs.writeFileSync(dest, YAML.stringify(out));
  say(`${C.grn}✓${C.x} ${path.relative(ROOT, dest)}`);
  say(YAML.stringify(out).split('\n').map((l) => '  ' + l).join('\n'));
}

function cmdRecall(n) {
  const dir = path.join(ROOT, 'creative_memory');
  const files = exists(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort().reverse().slice(0, Number(n) || 5) : [];
  if (!files.length) { say(`${C.dim}no fingerprints yet — nothing to avoid repeating${C.x}`); return; }
  const tally = {};
  const camFn = {}, camMotion = {}, undeclared = [];
  for (const f of files) {
    const d = readYaml(path.join(dir, f));
    const frozen = d.status && d.status !== 'active';
    say(`\n${C.b}${d.video_id}${C.x} ${C.dim}${d.title || ''}${C.x}` +
      (frozen ? `  ${C.cyn}${d.status}${C.x}` : ''));
    // Devices this video BUILT AND DELETED. Printed before the ones it kept, because the
    // failure mode this guards against is the next video reaching for a rejected device
    // on the grounds that it looks like the library's house style.
    for (const r of d.rejected_devices || []) {
      say(`  ${C.yel}rejected${C.x} ${r.device}`);
      if (r.why_rejected) say(`    ${C.dim}${String(r.why_rejected).replace(/\s+/g, ' ').trim()}${C.x}`);
    }
    for (const k of ['representation_layers', 'dominant_compositions', 'dominant_geometry', 'visual_devices', 'motion_devices', 'typography_usage', 'distinctive_device']) {
      if (!d[k]) continue;
      const vals = [].concat(d[k]);
      say(`  ${k.padEnd(24)} ${vals.join(', ')}`);
      for (const val of vals) { tally[k] = tally[k] || {}; tally[k][val] = (tally[k][val] || 0) + 1; }
    }
    for (const c of d.camera || []) {
      say(`  ${'camera'.padEnd(24)} ${c.shot}: ${c.motion} -> ${C.cyn}${c.semantic_function}${C.x}`);
      camFn[c.semantic_function] = (camFn[c.semantic_function] || 0) + 1;
      camMotion[c.motion] = (camMotion[c.motion] || 0) + 1;
      if (c.semantic_function === 'UNDECLARED') undeclared.push(`${d.video_id}/${c.shot}`);
    }
  }

  say(`\n${C.b}habits across the last ${files.length}${C.x}  ${C.dim}(a device in every recent video is a habit until proven semantic)${C.x}`);
  for (const [k, vals] of Object.entries(tally)) {
    const hot = Object.entries(vals).filter(([, c]) => c >= Math.max(2, files.length)).map(([v2]) => v2);
    if (hot.length) say(`  ${C.yel}${k}${C.x}: ${hot.join(', ')}`);
  }

  // Camera is judged on REASONS. The same motion used for two different arguments
  // is not repetition; the same argument reused is, whatever the motion looks like.
  const fnHot = Object.entries(camFn).filter(([k, c]) => k !== 'UNDECLARED' && c >= 3).sort((a, b) => b[1] - a[1]);
  if (fnHot.length) {
    say(`  ${C.yel}camera reasoning${C.x}: ${fnHot.map(([k, c]) => `${k} ×${c}`).join(', ')}`);
    say(`  ${C.dim}same visual ARGUMENT reused — that is the repetition worth attacking, not the motion.${C.x}`);
  }
  const mHot = Object.entries(camMotion).filter(([, c]) => c >= 3).map(([k, c]) => `${k} ×${c}`);
  if (mHot.length) say(`  ${C.dim}camera motions: ${mHot.join(', ')} — only a habit if the reasons repeat too${C.x}`);
  if (undeclared.length) {
    say(`  ${C.red}undeclared camera${C.x}: ${undeclared.join(', ')}`);
    say(`  ${C.dim}these are static because nobody decided, which is the habit itself.${C.x}`);
  }
}

// ----------------------------------------------------------------- ingest ----
/**
 * The upstream boundary.
 *
 * A Content Package is authored in a different repo, by a different agent, under a
 * contract that repo owns. This side does exactly two things: it refuses to ingest a
 * package the PRODUCER's own validator rejects, and it records precisely which bytes it
 * ingested.
 *
 * Why the producer's validator and never one of ours: whether a package is valid is a
 * question about the contract, and the contract belongs to the sending side. A second
 * opinion here would be a second source of truth — which is the exact defect this
 * boundary exists to prevent. See ARCHITECTURE.md, "Upstream boundary".
 *
 * Why a hash and not a version: `schema_version` detects a change of CONTRACT. A hash
 * detects a change of CONTENT. E01 needed the second one and had neither — its source
 * package was modified 2h24m after final.mp4 was composed, and because no snapshot was
 * kept there is nothing left to diff against.
 */
function findValidator(startDir) {
  let d = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    const cand = path.join(d, 'tools', 'validate-package.mjs');
    if (exists(cand)) return cand;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Recorded as null rather than guessed. An invented commit id is worse than an honest
 *  absence, and a commit id for a dirty file does not identify the bytes we took. */
function gitFacts(dir, file) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) return { commit: null, note: 'source is not in a git working tree' };
  const commit = (r.stdout || '').trim();
  const st = spawnSync('git', ['-C', dir, 'status', '--porcelain', '--', file],
    { encoding: 'utf8', windowsHide: true });
  const dirty = !!(st.stdout || '').trim();
  return {
    commit,
    note: dirty ? 'file has uncommitted changes — this commit id does not identify these bytes' : null,
  };
}

const iso = (d) => new Date(d).toISOString();

function cmdImport(srcArg, opts = {}) {
  if (!srcArg) die('usage: cv import <content-package-path> --as <video-id> [--retroactive] [--force]');
  const src = path.resolve(srcArg);
  if (!exists(src) || !fs.statSync(src).isFile()) die(`no package file at ${src}`);
  const videoId = typeof opts.as === 'string' ? opts.as : null;
  if (!videoId) die('--as <video-id> is required — the snapshot is stored per video');

  // ---- 1. the producer decides whether this package is valid ----------------
  const validator = findValidator(path.dirname(src));
  if (!validator) {
    die(`cannot find tools/validate-package.mjs above ${src}\n` +
      `  refusing to import: this side does not get to decide whether a package is valid`);
  }
  const vr = spawnSync(process.execPath, [validator, src], { encoding: 'utf8', windowsHide: true });
  const vout = stripAnsi((vr.stdout || '') + (vr.stderr || '')).trim();
  if (vr.status !== 0) {
    say(`${C.red}✗${C.x} refused — the producer's validator rejected this package`);
    say(vout.split('\n').map((l) => '  ' + l).join('\n'));
    say(`${C.dim}nothing was written${C.x}`);
    process.exit(1);
  }
  const verdict = vout.split('\n').map((l) => l.trim()).filter(Boolean).pop() || 'exit 0';

  // ---- 2. what the package says about itself -------------------------------
  const pkg = readYaml(src);
  const pkgDir = path.basename(path.dirname(src));
  const slug = pkgDir.replace(/^\d+-/, '');
  const notes = [];
  if (pkg.revision === undefined) {
    notes.push('package carries no `revision` field, so revision is not expressible in this ' +
      'contract — only content identity is. source_sha256 is what identifies these bytes.');
  }

  const repoRoot = path.dirname(path.dirname(validator));
  const git = gitFacts(repoRoot, src);
  if (git.note) notes.push(`source_git_commit: ${git.note}`);

  const srcSha = sha256File(src);
  const srcStat = fs.statSync(src);

  // ---- 3. the immutable snapshot ------------------------------------------
  const vdir = path.join(ROOT, 'videos', videoId);
  fs.mkdirSync(vdir, { recursive: true });
  const snapPath = path.join(vdir, 'content-package.yaml');
  if (exists(snapPath) && !opts.force) {
    die(`${snapPath} already exists.\n` +
      `  A snapshot is declared immutable, so this refuses rather than overwrites.\n` +
      `  Pass --force only if you intend to discard the recorded provenance.`);
  }
  if (exists(snapPath)) fs.chmodSync(snapPath, 0o644);
  fs.copyFileSync(src, snapPath);
  fs.chmodSync(snapPath, 0o444);          // read-only: the snapshot is evidence, not a draft

  // ---- 4. provenance ------------------------------------------------------
  // `retroactive` is load-bearing. For a video that was built before ingestion existed,
  // the bytes it actually consumed were never recorded and are unrecoverable. Writing
  // today's hash as `consumed_sha256` would make `cv provenance` answer CURRENT, which
  // would be a lie. So it is recorded as unknown, and the timestamps that prove the
  // source moved afterwards are recorded as evidence instead.
  const retro = !!opts.retroactive;
  const composed = path.join(vdir, 'output', 'final.mp4');
  const prov = {
    package_id: String(pkg.id ?? ''),
    package_slug: slug,
    schema_version: pkg.schema_version ?? null,
    package_revision: pkg.revision ?? null,
    source_path: src.replace(/\\/g, '/'),
    source_sha256: srcSha,
    source_git_commit: git.commit,
    imported_at: iso(Date.now()),
    validation_result: {
      validator: path.relative(repoRoot, validator).replace(/\\/g, '/'),
      exit_code: vr.status,
      verdict,
    },
    consumed_as: videoId,
    snapshot: path.relative(ROOT, snapPath).replace(/\\/g, '/'),
    snapshot_sha256: sha256File(snapPath),
    // the bytes this video was actually built from
    consumed_sha256: retro ? 'unknown' : srcSha,
    retroactive: retro,
    topic: pkg.topic ?? null,
    domain: pkg.domain ?? null,
    source_modified_at: iso(srcStat.mtimeMs),
  };
  if (retro) {
    notes.unshift('RETROACTIVE. This video was built before ingestion existed; no snapshot ' +
      'was kept, so the bytes it consumed are unrecoverable. consumed_sha256 is therefore ' +
      'unknown and `cv provenance` can never report CURRENT for it.');
    prov.evidence_of_change = {
      video_composed_at: exists(composed) ? iso(fs.statSync(composed).mtimeMs) : null,
      source_modified_at: iso(srcStat.mtimeMs),
      reasoning: 'the source was modified after this video was composed, so it is not the ' +
        'content the video was built from. What differs cannot be determined from this side.',
    };
  }
  if (notes.length) prov.notes = notes;

  fs.writeFileSync(path.join(vdir, 'PROVENANCE.yaml'), YAML.stringify(prov));

  say(`${C.grn}✓${C.x} imported package ${prov.package_id} (${slug}) as ${videoId}`);
  say(`  ${C.dim}validator${C.x}  ${prov.validation_result.validator} -> exit 0, ${verdict}`);
  say(`  ${C.dim}snapshot ${C.x}  ${prov.snapshot} ${C.dim}(read-only)${C.x}`);
  say(`  ${C.dim}sha256   ${C.x}  ${srcSha}`);
  if (retro) say(`  ${C.yel}retroactive${C.x} — consumed_sha256 unknown, see PROVENANCE.yaml notes`);
}

// ------------------------------------------------------------- provenance ----
/**
 * Informational, always. SOURCE_CHANGED on a frozen benchmark is a fact worth knowing and
 * nothing more: it never rewrites the plan, never re-renders, never unfreezes. A tool that
 * invalidated a frozen video on its own would make freezing meaningless.
 */
function cmdProvenance(only) {
  const vroot = path.join(ROOT, 'videos');
  const all = exists(vroot) ? fs.readdirSync(vroot) : [];
  const ids = (only ? [only] : all).filter((id) => exists(path.join(vroot, id, 'PROVENANCE.yaml')));

  if (!ids.length) {
    const missing = (only ? [only] : all).filter((id) => exists(path.join(vroot, id)));
    say(`${C.dim}no PROVENANCE.yaml${only ? ` for ${only}` : ''} — ` +
      `${missing.length} video(s) with no recorded upstream package${C.x}`);
    say(`${C.dim}  cv import <content-package-path> --as <video-id>${C.x}`);
    return;
  }

  for (const id of ids) {
    const vdir = path.join(vroot, id);
    const p = readYaml(path.join(vdir, 'PROVENANCE.yaml'));
    const planPath = path.join(vdir, 'shot_plan.yaml');
    const frozen = exists(planPath) ? (readYaml(planPath).status || null) : null;

    let state, detail = [];

    // Snapshot integrity first: everything below is only meaningful if the evidence on
    // this side has not been edited.
    const snap = path.join(ROOT, p.snapshot || '');
    let snapOk = null;
    if (p.snapshot && exists(snap)) {
      snapOk = sha256File(snap) === p.snapshot_sha256;
      if (!snapOk) detail.push(`${C.red}snapshot has been modified since import${C.x} — ` +
        `${p.snapshot} no longer hashes to snapshot_sha256`);
    } else if (p.snapshot) {
      detail.push(`${C.red}snapshot missing${C.x} — ${p.snapshot}`);
    }

    const srcPath = p.source_path || '';
    if (!srcPath || !exists(srcPath)) {
      state = 'SOURCE_UNAVAILABLE';
      detail.push(`source not reachable: ${srcPath || '(none recorded)'}`);
      detail.push('the snapshot remains the record of what was consumed');
    } else if (p.consumed_sha256 === 'unknown') {
      // Retroactive: cannot be CURRENT, because what was consumed was never recorded.
      state = 'SOURCE_CHANGED';
      detail.push('consumed_sha256 is unknown (retroactive import) — CURRENT is not provable');
      const e = p.evidence_of_change || {};
      if (e.video_composed_at) detail.push(`video composed  ${e.video_composed_at}`);
      if (e.source_modified_at) detail.push(`source modified ${e.source_modified_at}`);
      detail.push('what differs cannot be determined from this side: no snapshot existed to diff');
    } else {
      const now = sha256File(srcPath);
      if (now === p.consumed_sha256) {
        state = 'CURRENT';
      } else {
        state = 'SOURCE_CHANGED';
        detail.push(`consumed ${String(p.consumed_sha256).slice(0, 16)}…`);
        detail.push(`source   ${now.slice(0, 16)}…`);
        detail.push(`source modified ${iso(fs.statSync(srcPath).mtimeMs)}`);
      }
    }

    const colour = state === 'CURRENT' ? C.grn : state === 'SOURCE_CHANGED' ? C.yel : C.dim;
    say(`\n${C.b}${id}${C.x}  package ${p.package_id} ${C.dim}${p.package_slug}${C.x}` +
      (frozen ? `  ${C.cyn}${frozen}${C.x}` : ''));
    say(`  ${colour}${state}${C.x}`);
    for (const d of detail) say(`    ${C.dim}${d}${C.x}`);
    if (state === 'SOURCE_CHANGED' && frozen) {
      say(`    ${C.dim}informational only — a frozen video is not invalidated or rebuilt by this${C.x}`);
    } else if (state === 'SOURCE_CHANGED') {
      say(`    ${C.dim}not frozen: re-read the package before continuing — Step 1 may have moved${C.x}`);
    }
  }
}

// ------------------------------------------------------------------ voice ----
/**
 * Narration audio, through a provider boundary.
 *
 * `cv` never talks to VoiceStudio directly and no shot ever does: the chain is
 * Content Package narration → VoiceProvider → adapter → provider API → audio artifact.
 * Shots consume the measured duration from VOICE_PROVENANCE.yaml, so replacing the
 * provider later touches one adapter and nothing else.
 *
 * The Colab runtime being off is a normal state, not a failure. `inspect` exists so that
 * "the backend is not running" and "the integration is broken" can never be confused.
 */
/**
 * Turn whatever the plan pinned — an id or a human name — into ONE concrete profile id,
 * before a single second of audio exists.
 *
 * This has to happen up front because the provider will not complain later:
 * generation.py:1312 reads `if profile_id:` then `if row:`, so an id matching no row falls
 * through to the default voice and still returns HTTP 200 with a playable WAV. A typo would
 * surface as a video that changes voice partway through, with every segment reporting
 * success.
 */
async function resolveVoiceProfile(adapter, wanted, STATE) {
  const direct = await adapter.getProfile(wanted);
  if (direct.state === STATE.SUCCEEDED && direct.body?.id) {
    return { id: String(direct.body.id), name: direct.body.name ?? null, matched: 'id' };
  }
  if (direct.state === STATE.UNREACHABLE) {
    die(`cannot reach the provider to resolve voice profile "${wanted}": ${direct.reason}`);
  }

  // Not an id on this endpoint. A name is the other thing an operator would reasonably
  // write, so try that — but only accept an unambiguous single match.
  const all = await adapter.listProfiles();
  if (all.state !== STATE.SUCCEEDED) {
    die(`voice profile "${wanted}" is not an id here, and /profiles could not be read: ${all.reason}`);
  }
  const rows = Array.isArray(all.body) ? all.body : [];
  const norm = (x) => String(x ?? '').trim().toLowerCase();
  const hits = rows.filter((x) => norm(x?.name) === norm(wanted));

  if (hits.length === 1) return { id: String(hits[0].id), name: hits[0].name ?? null, matched: 'name' };
  if (hits.length > 1) {
    die(`"${wanted}" matches ${hits.length} voice profiles by name (${hits.map((h) => h.id).join(', ')})`
      + ` — pin the id in shot_plan.yaml so the choice is not left to row ordering`);
  }
  const names = rows.map((x) => `${x.id}${x.name ? ' (' + x.name + ')' : ''}`).slice(0, 12);
  die(`voice profile "${wanted}" does not exist on this endpoint.\n`
    + `  ${rows.length} profile(s) available: ${names.join(', ')}${rows.length > 12 ? ', …' : ''}\n`
    + `  Refusing to generate: an unknown profile_id is silently ignored by the provider and\n`
    + `  the narration would come back in the default voice.`);
}

async function cmdVoice(sub, id, opts = {}) {
  const { STATE, NOT_CONFIGURED, loadNarration, writeProvenance, readProvenance, resolve, sha256 } =
    await import('./voice/provider.mjs');

  if (sub === 'timing') {
    // Pure report over VOICE_PROVENANCE.yaml + shot_plan.yaml — no provider contact.
    const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'voice', 'timing.mjs'), id],
      { stdio: 'inherit', windowsHide: true });
    process.exit(r.status ?? 1);
  }
  if (!sub || !['inspect', 'generate'].includes(sub)) {
    die('usage: cv voice inspect|generate|timing <video-id>');
  }
  const v = loadVideo(id);
  const nar = loadNarration(v.dir);

  say(`${C.b}narration${C.x}  package ${nar.package_id}  ${C.dim}${nar.chars} chars`
    + `${nar.syllable_count ? `, ${nar.syllable_count} syllables` : ''}`
    + `${nar.estimated_duration_sec ? `, package estimate ${nar.estimated_duration_sec}s` : ''}${C.x}`);
  say(`  ${C.dim}sha256 ${nar.sha256}${C.x}`);

  const prov = readProvenance(v.dir);
  if (prov) {
    const stale = prov.narration_sha256 !== nar.sha256;
    say(`  ${C.dim}existing audio: ${prov.audio_file} · ${prov.audio_duration}s · ${prov.generated_at}${C.x}`);
    if (stale) say(`  ${C.yel}?${C.x} recorded narration_sha256 differs from the package — the audio is stale`);
  }

  const r = await resolve();
  if (!r.ok) {
    say(`\n${C.yel}${r.state}${C.x}`);
    say(`  missing: ${r.missing.join(', ')}`);
    say(`  ${C.dim}${r.hint}${C.x}`);
    // Not an error exit: nothing is broken, a runtime value is simply absent.
    return;
  }

  const health = await r.adapter.probe();
  if (health.state !== STATE.CONFIGURED) {
    say(`\n${C.yel}${health.state}${C.x}  ${health.reason}`);
    if (health.starting) say(`  ${C.dim}this is "still loading", not "dead" — retry shortly${C.x}`);
    else say(`  ${C.dim}start the Colab runtime and re-publish the tunnel URL${C.x}`);
    return;
  }
  say(`\n${C.grn}${STATE.CONFIGURED}${C.x}  device=${health.device}  version=${health.version}`);
  say(`  ${C.dim}endpoint ${r.adapter.identity()}${C.x}`);

  if (sub === 'inspect') return;

  // ---- generate -----------------------------------------------------------
  // ONE voice for one video, at ONE set of settings, and both live in the video's own plan
  // rather than in this file, in an environment variable, or in whatever someone typed. A
  // run that took its speed from the command line once produced 35 segments at the
  // provider's default rate with random per-segment seeds, and the only sign was a missing
  // key in the provenance afterwards.
  const cal = v.plan.voice_calibration || {};
  const params = {};
  const paramSource = {};
  for (const field of ['speed', 'seed', 'language', 'engine', 'num_step']) {
    if (opts[field] !== undefined && opts[field] !== true) {
      params[field] = opts[field]; paramSource[field] = 'command line (overrides the plan)';
    } else if (cal[field] !== undefined && cal[field] !== null) {
      params[field] = cal[field]; paramSource[field] = 'shot_plan.yaml voice_calibration';
    }
  }
  // speed is the one that changes the deliverable — the whole shot architecture is timed
  // around a measured duration, and generating at a different rate invalidates it silently.
  if (params.speed === undefined) {
    die('no speed pinned for this video.\n'
      + '  Set voice_calibration.speed in shot_plan.yaml (or pass --speed <n>).\n'
      + '  The provider default is 1.0, and the shot durations were measured at a rate this\n'
      + '  plan chose deliberately; generating at another one is not a neutral fallback.');
  }

  const wantedProfile = (opts.profile !== undefined && opts.profile !== true)
    ? opts.profile : cal.profile_id;
  if (!wantedProfile) {
    die('no voice profile pinned for this video.\n'
      + '  Set voice_calibration.profile_id in shot_plan.yaml (or pass --profile=<id|name>).\n'
      + '  Generating without one takes whatever voice the provider currently defaults to,\n'
      + '  which is not a decision anyone made and not one that survives a restart.');
  }
  const pinned = await resolveVoiceProfile(r.adapter, wantedProfile, STATE);
  params.profile_id = pinned.id;
  say(`  ${C.dim}voice profile ${pinned.id}${pinned.name ? ' (' + pinned.name + ')' : ''}`
    + ` — matched by ${pinned.matched}${C.x}`);

  // Generated PER AUTHORED PARAGRAPH, for two reasons that happen to agree:
  //   a Cloudflare quick tunnel drops any origin response slower than ~100s (HTTP 524 on
  //   the full 166s narration), and per-beat durations are what the timing checkpoint
  //   needs anyway. splitNarration refuses to proceed unless rejoining the pieces
  //   reproduces the canonical text exactly.
  const { splitNarration } = await import('./voice/provider.mjs');
  const segments = splitNarration(nar.text);
  const voiceDir = path.join(v.dir, 'voice');
  fs.mkdirSync(voiceDir, { recursive: true });

  say(`\n${C.dim}generating ${segments.length} segments — first call on a fresh runtime also loads the model${C.x}`);
  const t0 = Date.now();
  const segRecords = [];
  const segFiles = [];

  // The first call loads (and may download) the model, so it is allowed to be slow. If the
  // SECOND one is still paying that price, something is reloading per request and 35
  // segments would take the better part of an hour — worth stopping for, not sitting out.
  const WARM_CEILING_SEC = 45;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const tSeg = Date.now();
    // 35 sequential calls over a quick tunnel will meet a 502 sooner or later — one did, at
    // segment 3 of 35, and losing the whole run to a blink is not a useful strictness. What
    // is NOT retried: dropped chunks, unusable audio, a wrong profile. Those are answers
    // about the take, and asking again would only produce a second wrong take.
    let out, wallSec;
    for (let attempt = 1; ; attempt++) {
      out = await r.adapter.generate(seg, params);
      wallSec = (Date.now() - tSeg) / 1000;
      if (out.state === STATE.SUCCEEDED || !out.retryable || attempt >= 4) break;
      const waitMs = 2000 * attempt;
      say(`${C.yel}?${C.x} segment ${i + 1}/${segments.length}: ${out.reason} — `
        + `lần ${attempt}/3, chờ ${waitMs / 1000}s rồi thử lại`);
      await new Promise((z) => setTimeout(z, waitMs));
    }
    if (out.state !== STATE.SUCCEEDED) {
      say(`${C.red}${out.state}${C.x}  segment ${i + 1}/${segments.length}: ${out.reason}`);
      if (out.detail) say(`  ${C.dim}${out.detail}${C.x}`);
      say(`  ${C.dim}${segments.length - i} segment(s) not generated — nothing was concatenated${C.x}`);
      process.exit(1);
    }
    if (i >= 1 && wallSec > WARM_CEILING_SEC) {
      say(`${C.red}${STATE.FAILED}${C.x}  segment ${i + 1}/${segments.length} took ${wallSec.toFixed(0)}s on a warm runtime`);
      say(`  ${C.dim}the model appears to reload per request; ${segments.length - i - 1} remaining segments`
        + ` would take ~${(((segments.length - i - 1) * wallSec) / 60).toFixed(0)} more minutes${C.x}`);
      say(`  ${C.dim}stopping to investigate — nothing was concatenated${C.x}`);
      process.exit(1);
    }

    // A take is not accepted until the provider says which voice made it. One small GET per
    // segment is the only thing standing between a typo and a narration that changes voice
    // halfway through while every segment reports success.
    if (!out.audioId) {
      say(`${C.red}${STATE.FAILED}${C.x}  segment ${i + 1}/${segments.length}: no X-Audio-Id, `
        + `so which voice produced it cannot be established`);
      say(`  ${C.dim}nothing was concatenated${C.x}`);
      process.exit(1);
    }
    const seen = await r.adapter.historyProfile(out.audioId);
    if (seen.state !== STATE.SUCCEEDED) {
      say(`${C.red}${STATE.FAILED}${C.x}  segment ${i + 1}/${segments.length}: ${seen.reason}`);
      say(`  ${C.dim}an unverifiable take is refused, not accepted — nothing was concatenated${C.x}`);
      process.exit(1);
    }
    if (String(seen.profileId ?? '') !== pinned.id) {
      say(`${C.red}${STATE.FAILED}${C.x}  segment ${i + 1}/${segments.length} came back in a different voice`);
      say(`  ${C.dim}asked for ${pinned.id} · provider recorded ${seen.profileId ?? '(none — default voice)'}${C.x}`);
      say(`  ${C.dim}refusing to concatenate mixed voices; ${i} segment(s) already on disk are not used${C.x}`);
      process.exit(1);
    }

    const f = path.join(voiceDir, `seg-${String(i + 1).padStart(3, '0')}.wav`);
    fs.writeFileSync(f, out.wav);
    segFiles.push(f);
    segRecords.push({
      index: i + 1,
      chars: seg.length,
      duration: out.durationSec,
      seed: out.seed,
      text_sha256: sha256(Buffer.from(seg, 'utf8')).slice(0, 16),
      first_words: seg.slice(0, 48),
      audio_id: out.audioId,
      profile_id: seen.profileId,
    });
    process.stdout.write(`\r  ${i + 1}/${segments.length}  `
      + `${segRecords.reduce((a, b) => a + b.duration, 0).toFixed(1)}s audio  `
      + `· last take ${wallSec.toFixed(1)}s      `);
  }
  say('');

  // Every segment was checked as it arrived; check the SET before joining it, because one
  // voice start to end is the claim the finished file makes.
  const voices = [...new Set(segRecords.map((x) => String(x.profile_id ?? '(none)')))];
  if (voices.length !== 1 || voices[0] !== pinned.id) {
    say(`${C.red}${STATE.FAILED}${C.x}  ${voices.length} distinct voice(s) across ${segRecords.length} segments: ${voices.join(', ')}`);
    say(`  ${C.dim}nothing was concatenated${C.x}`);
    process.exit(1);
  }
  say(`  ${C.dim}all ${segRecords.length} segments verified against provider history: profile ${pinned.id}${C.x}`);

  // Concat with -c copy: every segment came from the same engine at the same settings,
  // so the streams are identical and no re-encode is involved.
  const listFile = path.join(voiceDir, 'segments.txt');
  fs.writeFileSync(listFile, segFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n') + '\n');
  const audioPath = path.join(voiceDir, 'narration.wav');
  ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', audioPath]);

  const out = {
    wav: fs.readFileSync(audioPath),
    durationSec: Number(segRecords.reduce((a, b) => a + b.duration, 0).toFixed(2)),
    genTimeSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
    seed: segRecords[0]?.seed ?? null,
    audioId: null,
  };

  const record = {
    provider: 'VoiceStudio',
    source_repo: 'D:\\Project\\VoiceStudio',
    provider_endpoint_identity: r.adapter.identity(),
    narration_sha256: nar.sha256,
    voice_model: {
      engine: params.engine ?? '(provider default)',
      profile_id: pinned.id,
      profile_name: pinned.name,
      profile_pinned_as: wantedProfile,
      profile_verified: "per segment, against the provider's generation history — /generate "
        + 'does not report which voice it used, and an unknown profile_id silently falls back '
        + 'to the default voice with HTTP 200',
      device: health.device,
      backend_version: health.version,
    },
    generation_parameters: { ...params, pronounce: '(provider default: true)' },
    generation_parameters_source: paramSource,
    seed_used: out.seed,
    generated_at: new Date().toISOString(),
    audio_file: path.relative(ROOT, audioPath).replace(/\\/g, '/'),
    audio_sha256: sha256(out.wav),
    audio_duration: out.durationSec,
    segments: segRecords,
    segmentation: "per authored paragraph; splitNarration verifies the rejoin equals the canonical text. No silence inserted between segments — inter-beat pauses are a video decision, not a measurement.",
    generation_time_sec: out.genTimeSec,
    package_estimate_sec: nar.estimated_duration_sec,
  };
  const pPath = writeProvenance(v.dir, record);

  say(`${C.grn}${STATE.SUCCEEDED}${C.x}  ${out.durationSec}s audio in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  say(`  ${path.relative(ROOT, audioPath)}  ${C.dim}${(out.wav.length / 1e6).toFixed(1)} MB${C.x}`);
  say(`  ${path.relative(ROOT, pPath)}`);
  if (nar.estimated_duration_sec) {
    const d = out.durationSec - nar.estimated_duration_sec;
    say(`  ${C.dim}package estimated ${nar.estimated_duration_sec}s — measured is ${d >= 0 ? '+' : ''}${d.toFixed(1)}s${C.x}`);
  }
}

// -------------------------------------------------------------------- cli ----
const [, , cmd, ...rest] = process.argv;
const flags = {};
const pos = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const eq = a.indexOf('=');
    if (eq > 2) {
      flags[a.slice(2, eq).replace(/-/g, '_')] = a.slice(eq + 1);
    } else {
      const k = a.slice(2).replace(/-/g, '_');
      const nx = rest[i + 1];
      if (nx && !nx.startsWith('--')) { flags[k] = nx; i++; } else flags[k] = true;
    }
  } else pos.push(a);
}

switch (cmd) {
  case 'voice': cmdVoice(pos[0], pos[1], flags).catch((e) => die(e?.message || String(e))); break;
  case 'import': cmdImport(pos[0], flags); break;
  case 'provenance': cmdProvenance(pos[0]); break;
  case 'sem': cmdSem(pos[0], flags); break;
  case 'assert': cmdAssert(pos[0], pos[1], flags); break;
  case 'gate': cmdGate(pos[0], pos[1], flags); break;
  case 'snap': cmdSnap(pos[0], pos[1], flags); break;
  case 'onion': cmdOnion(pos[0], pos[1], pos[2] || '#stage', flags); break;
  case 'sheet': cmdSheet(pos[0]); break;
  case 'gallery': cmdGallery(); break;
  case 'ab': cmdAb(pos[0], pos[1], pos[2]); break;
  case 'variety': cmdVariety(pos[0]); break;
  case 'render': cmdRender(pos[0], pos[1], flags); break;
  case 'compose': cmdCompose(pos[0]); break;
  case 'fingerprint': cmdFingerprint(pos[0]); break;
  case 'recall': cmdRecall(pos[0]); break;
  default:
    say(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(2, 22).join('\n').replace(/^ \* ?/gm, ''));
}
