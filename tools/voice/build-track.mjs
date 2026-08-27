#!/usr/bin/env node
/**
 * Build the timed narration track and the per-shot beat table.
 *
 *   node tools/voice/build-track.mjs <video-id>
 *
 * Two artifacts, one source of truth:
 *
 *   voice/narration_timed.wav   segments in order, with each shot's designed silence
 *                               appended at the END of that shot. Total length equals
 *                               planned runtime exactly.
 *   voice/shot_timing.json      per shot, the offset of every narration beat measured
 *                               from that shot's own t=0.
 *
 * Silence goes at the END of a shot because that is what the headroom was assigned for:
 * every pause in SHOT_ARCHITECTURE was justified as something needing to LAND before the
 * cut — a claim carried into the next shot, a refusal not worth dwelling on, a question
 * left open. Putting it at the front would turn a hold into a delay.
 *
 * Nothing here stretches audio or edits narration. Silence is generated, never derived
 * from speech.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const id = process.argv[2];
if (!id) { console.error('usage: node tools/voice/build-track.mjs <video-id>'); process.exit(1); }

const vdir = path.join(ROOT, 'videos', id);
const voice = path.join(vdir, 'voice');
const prov = YAML.parse(fs.readFileSync(path.join(vdir, 'VOICE_PROVENANCE.yaml'), 'utf8'));
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const shots = (plan.shots || []).filter((s) => Array.isArray(s.narration_segments))
  .sort((a, b) => a.time[0] - b.time[0]);

const ff = (args) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args],
    { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
};

// The plan pins the speed; the provenance records the speed the audio on disk was made at.
// When they disagree, the audio is from a calibration that has been retired, and building a
// track from it would quietly ship a voice nobody chose. This is not hypothetical: a run at
// speed 1.00 died at segment 3 of 35 and left seg-001/002 from the new speed sitting beside
// thirty-three segments from the old one.
{
  const planned = (plan.voice_calibration || {}).speed;
  const made = prov.generation_parameters?.speed;
  if (planned !== undefined && made !== undefined && Number(planned) !== Number(made)) {
    console.error(`voice_calibration.speed is ${planned} but the audio on disk was generated at ${made}.`);
    console.error("Regenerate before building a track — nothing was written.");
    process.exit(1);
  }
}

const RATE = 24000;                       // matches every generated segment

/* A hold longer than this is dead air, not a beat. The longest hold this architecture ever
 * designed is 2.63s, and that one is the closing question. The number matters because the
 * failure it catches is silent in the other direction: shot durations were chosen around a
 * measured narration, so a LATER narration that speaks faster leaves the same frames padded
 * with more silence, the track still totals exactly the planned runtime, and cv compose is
 * satisfied. Nothing complains, and every designed pause quietly becomes waiting. */
const MAX_HOLD_SEC = 3.0;

/* The previous table, read before this run overwrites it. A rebuild against new audio should
 * say what moved rather than leave the operator to diff two JSON files by eye. */
const prevPath = path.join(voice, 'shot_timing.json');
const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf8')) : null;

const pieces = [];
const table = {};
const overlong = [];
let cursor = 0;

for (const s of shots) {
  const [a, b] = s.narration_segments;
  const mine = prov.segments.filter((x) => x.index >= a && x.index <= b);
  const speech = +mine.reduce((t, x) => t + x.duration, 0).toFixed(3);
  const hold = +(s.duration - speech).toFixed(3);
  if (hold < 0) { console.error(`${s.id}: speech ${speech}s exceeds duration ${s.duration}s`); process.exit(1); }
  if (hold > MAX_HOLD_SEC) overlong.push(`${s.id} ${hold.toFixed(2)}s`);

  let off = 0;
  const beats = mine.map((x) => {
    const beat = { seg: x.index, start: +off.toFixed(3), duration: x.duration, text: x.first_words };
    off = +(off + x.duration).toFixed(3);
    pieces.push(path.join(voice, `seg-${String(x.index).padStart(3, '0')}.wav`));
    return beat;
  });

  // One silence file per shot, named so the concat list reads as the edit it is.
  const sil = path.join(voice, `hold-${s.id}.wav`);
  ff(['-f', 'lavfi', '-i', `anullsrc=r=${RATE}:cl=mono`, '-t', String(hold),
      '-c:a', 'pcm_s16le', sil]);
  pieces.push(sil);

  table[s.id] = {
    shot_start: s.time[0], duration: s.duration,
    speech, hold_at_end: hold, beats,
  };
  cursor = +(cursor + s.duration).toFixed(3);
}

if (overlong.length) {
  report();
  console.error(`\n${overlong.length} shot(s) hold longer than ${MAX_HOLD_SEC}s: ${overlong.join(', ')}`);
  console.error('That is dead air, not a beat. The frames were timed around a different');
  console.error('narration; re-run the Step 4 timing architecture against this one rather');
  console.error('than shipping the same shots with the slack absorbed into their holds.');
  console.error('\nNothing was written — a track built to this table would still total the');
  console.error('planned runtime, and cv compose compares only length, so it would ship.');
  process.exit(1);
}

const list = path.join(voice, 'timed.txt');
fs.writeFileSync(list, pieces.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n') + '\n');
const out = path.join(voice, 'narration_timed.wav');
ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);

// Stamp the table with the narration it was built from. Length alone cannot tell a track
// apart from a different one of the same length — and every track this tool builds is
// exactly the planned runtime by construction, so length is the one thing that never
// differs. Without this, a track from a previous voice passes every downstream check.
fs.writeFileSync(path.join(voice, 'shot_timing.json'), JSON.stringify({
  built_from_audio_sha256: prov.audio_sha256,
  built_from_profile_id: prov.voice_model?.profile_id ?? null,
  speech_total: +Object.values(table).reduce((a, t) => a + t.speech, 0).toFixed(3),
  shots: table,
}, null, 2));

const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', out], { encoding: 'utf8', windowsHide: true });
const actual = Number((probe.stdout || '').trim());
console.log(`shots ${shots.length} · planned ${cursor}s · track ${actual}s · `
  + `match ${Math.abs(actual - cursor) < 0.02 ? 'yes' : 'NO'}`);

function report() {
  if (!prev) return;
  const rows = Object.entries(table)
    .map(([id, t]) => ({ id, d: +(t.speech - (prev[id]?.speech ?? t.speech)).toFixed(2),
      hold: t.hold_at_end, was: prev[id]?.hold_at_end ?? null }))
    .filter((r) => Math.abs(r.d) >= 0.05);
  const total = +Object.values(table).reduce((a, t) => a + t.speech, 0).toFixed(2);
  const prevTotal = +Object.values(prev).reduce((a, t) => a + t.speech, 0).toFixed(2);
  console.log(`\nspeech ${prevTotal}s -> ${total}s  (${total - prevTotal >= 0 ? '+' : ''}${(total - prevTotal).toFixed(2)}s)`);
  if (!rows.length) console.log('no shot moved by 0.05s or more — holds are unchanged');
  else {
    console.log(`${rows.length} shot(s) moved:`);
    for (const r of rows) {
      console.log(`  ${r.id.padEnd(18)} ${r.d >= 0 ? '+' : ''}${r.d}s speech   hold ${r.was}s -> ${r.hold}s`);
    }
  }
}

report();
console.log(`  ${path.relative(ROOT, out)}`);
console.log(`  ${path.relative(ROOT, path.join(voice, 'shot_timing.json'))}`);
