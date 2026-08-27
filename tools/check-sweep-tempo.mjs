#!/usr/bin/env node
/**
 * R16 — hai lượt duyệt không được cho phép so nhịp.
 *
 * CỔNG L2, ba dòng, khai trước khi chạy:
 *   1. Khẳng định: khoảng giữa hai lần nổ BẰNG NHAU ở cả hai lượt.
 *   2. Đại lượng đo: thời điểm khung đầu tiên mà ô 70×70 quanh MỖI dấu đổi so với nền của
 *      chính cửa sổ lượt đó; lấy hiệu hai thời điểm trong mỗi lượt.
 *   3. Vì sao KHÔNG phải thay thế: khẳng định nói về *khoảng giữa hai lần nổ*, và đây đo đúng
 *      khoảng đó TRÊN ARTIFACT. Không suy từ tham số animation trong source (source đúng mà
 *      render vẫn có thể sai), không suy từ tổng thời lượng lượt (một lượt dài hơn vẫn có thể
 *      giữ đúng khoảng).
 *
 *   node tools/check-sweep-tempo.mjs <video-id> [--eps 0.15]
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
if (!videoId) { console.error('usage: check-sweep-tempo.mjs <video-id> [--eps 0.15]'); process.exit(2); }
const ei = argv.indexOf('--eps');
const EPS = ei >= 0 ? Number(argv[ei + 1]) : 0.15;
const FPS = 20, BOX = 70;

const W = 1080;
const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const shots = (plan.shots || []).filter((s) => s.sweep_tempo);
if (!shots.length) { console.log('không shot nào khai sweep_tempo'); process.exit(0); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'swp-'));
const G = { x0: 170, p0: 496.6, p1: 500.6, x1: 910, yLine: 1000 };
const X = (p) => Math.round(G.x0 + (p - G.p0) / (G.p1 - G.p0) * (G.x1 - G.x0));

/** chuỗi khung xám trong một cửa sổ, lấy mẫu FPS */
function seq(f, from, to, tag) {
  const dir = path.join(TMP, tag);
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-t', String(to - from),
    '-i', f, '-vf', `fps=${FPS}`, path.join(dir, '%04d.png')], { windowsHide: true });
  return fs.readdirSync(dir).sort().map((n, i) => ({
    t: +(from + i / FPS).toFixed(3),
    buf: execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(dir, n), '-pix_fmt', 'gray',
      '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26, windowsHide: true }),
  }));
}
/** thời điểm ô quanh (x,y) lần đầu đổi đáng kể so với khung đầu cửa sổ */
function firstChange(frames, x, y) {
  const base = frames[0].buf;
  for (const fr of frames.slice(1)) {
    let d = 0;
    for (let yy = y - BOX / 2; yy < y + BOX / 2; yy += 2) {
      for (let xx = x - BOX / 2; xx < x + BOX / 2; xx += 2) {
        const i = yy * W + xx;
        d += Math.abs(fr.buf[i] - base[i]);
      }
    }
    if (d / (BOX * BOX / 4) > 6) return fr.t;
  }
  return null;
}

let failed = 0;
for (const shot of shots) {
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot.id}  chưa render`); continue; }
  const st = shot.sweep_tempo;
  const rows = [];
  for (const [k, pass] of st.passes.entries()) {
    const frames = seq(f, pass.window[0], pass.window[1], shot.id + '_' + k);
    const t1 = firstChange(frames, X(pass.first), G.yLine);
    const t2 = firstChange(frames, X(pass.second), G.yLine);
    rows.push({ name: pass.name, t1, t2, gap: t1 !== null && t2 !== null ? +(t2 - t1).toFixed(3) : null });
  }
  console.log(`  ${shot.id}`);
  for (const r of rows) {
    console.log(`     ${String(r.name).padEnd(22)} nổ ở ${r.t1}s → ${r.t2}s   khoảng ${r.gap}s`);
  }
  const ok = rows.every((r) => r.gap !== null) && Math.abs(rows[0].gap - rows[1].gap) < EPS;
  const diff = rows.every((r) => r.gap !== null) ? Math.abs(rows[0].gap - rows[1].gap).toFixed(3) : '—';
  console.log(`     |Δ khoảng| = ${diff}s ${ok ? '<' : '≥'} eps ${EPS}`);

  if (st.expect === 'TEMPO_MISMATCH') {
    if (!ok) console.log('     ✓ negative control trượt đúng — phép kiểm có nổ thật');
    else { console.log('     ✗ NEGATIVE CONTROL LỌT — phép kiểm hỏng, đừng tin số shot khác'); failed++; }
  } else if (!ok) {
    failed++;
    console.log('     ✗ hai lượt cho hai nhịp khác nhau. Lock A quay lại qua TEMPO, không qua độ dốc.');
  } else {
    console.log('     ✓ hai lượt cùng nhịp — không có nhịp nào để so');
  }
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failed ? `\n${failed} shot có vấn đề\n` : '\nmọi shot đạt\n');
process.exitCode = failed ? 1 : 0;
