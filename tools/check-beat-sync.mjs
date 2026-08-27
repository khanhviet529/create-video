#!/usr/bin/env node
/**
 * Does every narration beat have something happening on screen?
 *
 * A source scan cannot answer this. Tweens scheduled inside a loop or a helper carry computed
 * times, so reading the file finds nothing and reports beats as unsynced that are perfectly
 * fine. The question is about the rendered result, so it is asked of the render.
 *
 * Method: sample each shot at 4fps, take the frame-to-frame difference, and require every
 * beat window to contain at least one frame that changed. A beat with no visual change is a
 * beat the picture sat out.
 *
 *   node tools/check-beat-sync.mjs <video-id>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const id = process.argv[2];
if (!id) { console.error('usage: check-beat-sync.mjs <video-id>'); process.exit(2); }

const vdir = path.join(ROOT, 'videos', id);
const T = JSON.parse(fs.readFileSync(path.join(vdir, 'voice/shot_timing.json'), 'utf8')).shots;

/* h264 alone moves YMAX on identical frames, so the floor has to sit above that. Measured on
   this project: an unchanged pair reads YMAX ~0-6; a single cell changing state reads >40. */
const CHANGED = 12;
const FPS = 4;

let missing = 0, total = 0;
for (const [shot, t] of Object.entries(T)) {
  const f = path.join(vdir, 'shots', shot, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot}  chưa render`); continue; }

  const out = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf',
    `fps=${FPS},tblend=all_mode=difference,signalstats,metadata=print:file=-`,
    '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
  const rows = [...out.matchAll(/pts_time:([\d.]+)[\s\S]*?YMAX=([\d.]+)/g)]
    .map((m) => ({ t: +m[1], y: +m[2] }));

  const miss = [];
  t.beats.forEach((b, i) => {
    total++;
    // a move is allowed to lead its words by up to 0.35s
    const lo = b.start - 0.35, hi = b.start + b.duration;
    if (!rows.some((r) => r.t >= lo && r.t < hi && r.y > CHANGED)) miss.push(i + 1);
  });
  if (miss.length) {
    missing += miss.length;
    console.log(`  ✗  ${shot}  beat ${miss.join(',')} không có gì đổi trên khung`);
  } else {
    console.log(`  ✓  ${shot}  ${t.beats.length} beat đều có chuyển động`);
  }
}
console.log(missing ? `\n${missing}/${total} beat không khớp\n` : `\ncả ${total} beat đều khớp\n`);
process.exitCode = missing ? 1 : 0;
