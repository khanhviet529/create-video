#!/usr/bin/env node
/**
 * Does the persistent world actually persist across chapter boundaries?
 *
 * A chapter that inherits a snapshot LOOKS right on its own. Drift only shows in the seam:
 * the last frame of one chapter against the first frame of the next. So that is what this
 * measures — PNG snapshots, not the h264 stream, because on near-identical frames h264 alone
 * reports YMAX≈120 and YAVG<0.15 either way and cannot discriminate.
 *
 * A boundary the plan declares LIÊN TỤC must read low; one it declares CẮT must read high.
 * Both directions matter: a "continuous" seam that jumps is a broken world, and a "cut" that
 * does not jump is a cut that is not doing anything.
 *
 *   node tools/check-continuity.mjs <video-id> [--threshold 1.2]
 *
 * The first version of this wrote A.png / B.png into one shared scratchpad path. Two copies
 * ran at once, clobbered each other's frames, and produced two tables that disagreed with
 * each other AND with the artifact — a real cut read as 1.75, a continuous seam as 50.14.
 * Nothing in either table looked wrong on its own. Temp files are now named per boundary and
 * per process, so concurrent runs cannot collide, and they are deleted as they are consumed.
 *
 * Caveat worth keeping in view: this is a whole-frame mean, so it is only as meaningful as
 * the amount of ink on screen. A seam between two nearly empty frames reads low whatever
 * happens in it — see ch01 → ch02, a real cut that measures 1.75 because neither side has
 * much ink. Treat a marginal number as "the instrument cannot tell", not as a pass.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const videoId = argv.find((a) => !a.startsWith('--'));
if (!videoId) { console.error('usage: check-continuity.mjs <video-id> [--threshold 1.2]'); process.exit(2); }
const ti = argv.indexOf('--threshold');
const THRESHOLD = ti >= 0 ? Number(argv[ti + 1]) : 1.2;

const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const shots = (plan.shots || []).filter((s) => s.status !== 'experiment' && Array.isArray(s.narration_segments));
if (shots.length < 2) { console.log('cần ít nhất hai shot để có ranh giới'); process.exit(0); }

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cont-'));
const frame = (file, atEnd, out) => execFileSync('ffmpeg',
  atEnd ? ['-v', 'error', '-y', '-sseof', '-0.05', '-i', file, '-frames:v', '1', out]
        : ['-v', 'error', '-y', '-i', file, '-frames:v', '1', out], { windowsHide: true });

console.log('ranh giới'.padEnd(39) + '  YAVG   khai báo');
let bad = 0, missing = 0;
for (let i = 0; i < shots.length - 1; i++) {
  const a = path.join(vdir, 'shots', shots[i].id, 'render.mp4');
  const b = path.join(vdir, 'shots', shots[i + 1].id, 'render.mp4');
  const label = (shots[i].id + ' → ' + shots[i + 1].id).padEnd(39);
  if (!fs.existsSync(a) || !fs.existsSync(b)) { console.log(label + '     ?   chưa render'); missing++; continue; }

  const A = path.join(TMP, i + 'A.png'), B = path.join(TMP, i + 'B.png');
  frame(a, true, A);
  frame(b, false, B);
  const out = execFileSync('ffmpeg', ['-v', 'error', '-i', A, '-i', B, '-filter_complex',
    'blend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
    { encoding: 'utf8', windowsHide: true });
  fs.rmSync(A, { force: true }); fs.rmSync(B, { force: true });

  const yavg = +(out.match(/YAVG=([\d.]+)/) || [0, 0])[1];
  const decl = String(shots[i + 1].transition_in || '').trim().startsWith('CẮT') ? 'CẮT' : 'LIÊN TỤC';
  const read = yavg < THRESHOLD ? 'liên tục' : 'khác hẳn';
  const ok = (decl === 'CẮT') === (read === 'khác hẳn');
  if (!ok) bad++;
  console.log(label + yavg.toFixed(2).padStart(6) + '   ' + decl.padEnd(9) + (ok ? '✓' : '✗ đo ra ' + read));
}
fs.rmSync(TMP, { recursive: true, force: true });

if (missing) console.log('\n' + missing + ' ranh giới chưa đo được');
console.log(bad ? '\n' + bad + ' ranh giới không khớp khai báo\n' : '\nmọi ranh giới khớp khai báo\n');
process.exitCode = bad ? 1 : 0;
