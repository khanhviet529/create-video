#!/usr/bin/env node
/**
 * A narrow, scenario-specific visual invariant, checked by MEASUREMENT.
 *
 *   Across the window in which an ORDINARY VACUUM runs, the allocated extent does not change.
 *
 * That is the whole check. It is NOT a claim that a PostgreSQL relation file can never shrink
 * — it can, and package 006 says so at narration beat 31. A rewrite chapter simply does not
 * declare this invariant.
 *
 * A first version scanned the shot's source for calls that animate the frame. It failed for a
 * real reason worth keeping: `growFrame` is legitimate during the CHURN phase of the same
 * shot, because the allocation genuinely does grow when the interior runs out of room. The
 * invariant is bounded in time, and the loop variables that schedule those tweens are not
 * statically knowable. So the check moved to where the claim actually lives — the rendered
 * artifact.
 *
 * Method: the allocation frame is drawn in --ink-dim and nothing else in the world is. Pull
 * the rendered frame at each end of the window as raw grey, keep only pixels in that band,
 * and compare the bounding box. If the extent moved, the box moved.
 *
 * Shots opt in with:
 *   extent_invariant: { from: <seconds>, to: <seconds>, y_min: <px>, note: <why> }
 * y_min is the top of the shot's world (default 400). Text above the world antialiases
 * into the same luma band as the frame, so a floor that is too high measures a box that
 * is not the frame — and such a box can hold still while the frame moves.
 * (vacuum_invariant is the original name and still works — VACUUM was only the first
 *  reason to claim the property, not the property itself.)
 *
 *   node tools/check-vacuum-invariant.mjs <video-id>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const videoId = process.argv[2];
if (!videoId) { console.error('usage: check-vacuum-invariant.mjs <video-id>'); process.exit(2); }

const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const invOf = (s) => s.extent_invariant || s.vacuum_invariant;
const shots = (plan.shots || []).filter(invOf);

if (!shots.length) {
  console.log('không shot nào khai extent_invariant — không có gì để kiểm');
  process.exit(0);
}

const W = 1080, H = 1920;
/* --ink-dim #8B9198 lands near luma 144. Live cells sit at ~236, dead at ~111, the empty-slot
   ring at ~66, ground at ~13. A band of ±14 isolates the frame and nothing else. */
const LO = 130, HI = 158;

function frameBox(file, t, yMin) {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26, windowsHide: true });
  // Antialiased edges of light text pass through the same luma band as the frame, so a
  // caption above the world would put its own rows in the box and mask a real move of the
  // frame. The world never sits above y=400 in this video; the registers above it do.
  const Y_MIN = yMin;
  let top = -1, bot = -1, left = W, right = -1, n = 0;
  for (let y = Y_MIN; y < H; y++) {
    let rowHit = false;
    for (let x = 0; x < W; x++) {
      const v = buf[y * W + x];
      if (v >= LO && v <= HI) {
        rowHit = true; n++;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    if (rowHit) { if (top < 0) top = y; bot = y; }
  }
  return { top, bot, left, right, n };
}

let failed = 0;
for (const shot of shots) {
  const win = invOf(shot);
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot.id}  chưa render`); continue; }
  if (typeof win !== 'object' || win.from === undefined || win.to === undefined) {
    console.log(`  ✗  ${shot.id}  extent_invariant phải khai { from, to }`);
    failed++; continue;
  }

  // The shot declares where its world starts; nothing above that line is the frame.
  const yMin = Number.isFinite(win.y_min) ? win.y_min : 400;
  const a = frameBox(f, win.from, yMin), b = frameBox(f, win.to, yMin);
  const same = a.top === b.top && a.bot === b.bot && a.left === b.left && a.right === b.right;
  const desc = (x) => `[${x.top}..${x.bot}] × [${x.left}..${x.right}]`;

  if (same) {
    console.log(`  ✓  ${shot.id}  ${win.from}s → ${win.to}s   biên cấp phát ${desc(a)} không đổi`);
  } else {
    failed++;
    console.log(`  ✗  ${shot.id}  biên cấp phát ĐÃ ĐỔI trong cửa sổ VACUUM`);
    console.log(`       ${win.from}s: ${desc(a)}`);
    console.log(`       ${win.to}s: ${desc(b)}`);
    console.log('       VACUUM thường đánh dấu chỗ dùng lại được BÊN TRONG bảng; nó không trả');
    console.log('       chỗ về hệ điều hành. Bất biến này thuộc về kịch bản đó, không phải luật');
    console.log('       chung — VACUUM FULL viết lại bảng và có làm file nhỏ lại.');
  }
}
console.log(failed ? `\n${failed} shot vi phạm\n` : `\n${shots.length} shot đạt\n`);
process.exitCode = failed ? 1 : 0;
