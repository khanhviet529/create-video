#!/usr/bin/env node
/**
 * R8 — đường replica phải là đường primary DỊCH ĐI, không phải một đường dốc khác.
 *
 * Vì sao phải đo trên artifact chứ không đọc source: semantic lock A ("replica chậm") rò rỉ
 * qua HÌNH HỌC chứ không qua chữ, nên `never_say` và mọi bộ lint đọc văn bản đều không bắt
 * được. Thứ duy nhất biết hai đường có song song hay không là khung hình đã render.
 *
 * Hai phép đo, cố ý khác sức mạnh:
 *
 *   1. ĐỘ DỐC trên đoạn dốc — phép được yêu cầu. |slope_p − slope_r| < eps.
 *      Đây là phép YẾU: hai đường bậc thang phần lớn là đoạn phẳng, nên nếu lấy độ dốc toàn
 *      cục thì cả hai đều ≈ 0 và phép kiểm đạt một cách vô nghĩa. Chỉ đo trên đoạn dốc.
 *
 *   2. RESIDUAL SAU TỊNH TIẾN — phép mạnh, và là phép khớp đúng khẳng định. Tìm độ dịch
 *      ngang dt khớp nhất giữa hai đường rồi đo sai số còn lại. Một đường bị KÉO GIÃN theo
 *      thời gian thì không phép tịnh tiến nào khớp được, nên residual bung ra. Phép này bắt
 *      được cả những vi phạm mà độ dốc bỏ lọt.
 *
 * Phân loại pixel bằng RGB chứ không bằng luma: --ink-mid (#9AA0A6, luma ~160) và
 * --authoritative (#C9A227, luma ~168) gần như trùng luma. Trung tính = biên độ kênh < 25.
 *
 *   node tools/check-parallel-lines.mjs <video-id> [--eps 0.02]
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
if (!videoId) { console.error('usage: check-parallel-lines.mjs <video-id> [--eps 0.02]'); process.exit(2); }
const ei = argv.indexOf('--eps');
const EPS = ei >= 0 ? Number(argv[ei + 1]) : 0.02;

const W = 1080, H = 1920;
const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const shots = (plan.shots || []).filter((s) => s.parallel_lines);
if (!shots.length) { console.log('không shot nào khai parallel_lines'); process.exit(0); }

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'par-'));

/** đường cong y(x): với mỗi cột, y trung bình của pixel thuộc lớp đó */
function curve(buf, pick) {
  const out = new Map();
  for (let x = 0; x < W; x++) {
    let sum = 0, n = 0;
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 3;
      const r = buf[i], g = buf[i + 1], b = buf[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn > 25) continue;                 // không trung tính → không phải đường node
      if (!pick(mx)) continue;
      sum += y; n++;
    }
    if (n >= 2 && n <= 40) out.set(x, sum / n);   // >40 = cụm dấu quan sát, bỏ
  }
  return out;
}

/** bình phương tối thiểu trên đoạn dốc: chỉ những cột mà y nằm hẳn giữa hai mức phẳng */
function riseSlope(c) {
  const ys = [...c.values()];
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const band = (hi - lo) * 0.18;
  const pts = [...c.entries()].filter(([, y]) => y > lo + band && y < hi - band);
  if (pts.length < 8) return null;
  const n = pts.length;
  const sx = pts.reduce((a, [x]) => a + x, 0), sy = pts.reduce((a, [, y]) => a + y, 0);
  const sxx = pts.reduce((a, [x]) => a + x * x, 0), sxy = pts.reduce((a, [x, y]) => a + x * y, 0);
  return { slope: (n * sxy - sx * sy) / (n * sxx - sx * sx), n };
}

/** độ dịch ngang khớp nhất, và sai số còn lại sau khi dịch */
function shiftResidual(a, b) {
  let best = null;
  for (let dx = -600; dx <= 600; dx++) {
    let sum = 0, n = 0;
    for (const [x, y] of a) {
      const yb = b.get(x + dx);
      if (yb === undefined) continue;
      sum += (yb - y) * (yb - y); n++;
    }
    if (n < 100) continue;
    const rms = Math.sqrt(sum / n);
    if (!best || rms < best.rms) best = { dx, rms, n };
  }
  return best;
}

let failed = 0;
for (const shot of shots) {
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot.id}  chưa render`); continue; }
  const at = shot.parallel_lines.at ?? (shot.duration - 0.4);
  const png = path.join(TMP, shot.id + '.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(at), '-i', f, '-frames:v', '1', png],
    { windowsHide: true });
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 26, windowsHide: true });

  const cp = curve(buf, (v) => v > 215);            // --ink       primary
  const cr = curve(buf, (v) => v >= 140 && v <= 180); // --ink-mid  replica (vùng chết 181-215)
  const sp = riseSlope(cp), sr = riseSlope(cr);
  const expectViolation = shot.parallel_lines.expect === 'VIOLATION';

  if (!sp || !sr) {
    console.log(`  ✗  ${shot.id}  không tách được hai đường (primary ${cp.size} cột, replica ${cr.size} cột)`);
    failed++; continue;
  }
  const d = Math.abs(sp.slope - sr.slope);
  const res = shiftResidual(cp, cr);
  const slopeOk = d < EPS;
  const shiftOk = res && res.rms < 2.0;
  const ok = slopeOk && shiftOk;

  console.log(`  ${ok ? '✓' : '✗'}  ${shot.id}  @${at}s`);
  console.log(`       độ dốc   primary ${sp.slope.toFixed(4)}  replica ${sr.slope.toFixed(4)}` +
    `  |Δ| ${d.toFixed(4)} ${slopeOk ? '<' : '≥'} eps ${EPS}`);
  console.log(`       tịnh tiến khớp nhất dx=${res ? res.dx : '—'}px` +
    `  residual ${res ? res.rms.toFixed(2) : '—'}px ${shiftOk ? '< 2.0' : '≥ 2.0'}`);

  if (expectViolation) {
    if (ok) {
      console.log('       ✗ NEGATIVE CONTROL ĐÃ LỌT — shot này tồn tại để TRƯỢT mà bộ kiểm cho đạt.');
      console.log('         Bộ kiểm hỏng, không phải shot. Đừng tin kết quả của các shot khác.');
      failed++;
    } else {
      console.log('       ✓ negative control trượt đúng như thiết kế — bộ kiểm có nổ thật');
    }
  } else if (!ok) {
    failed++;
    console.log('       hai đường KHÔNG song song. Hình đang nói "replica chạy chậm hơn", và đó là');
    console.log('       semantic lock A rò qua hình học. Replica phải là đường primary DỊCH ĐI.');
  }
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failed ? `\n${failed} shot có vấn đề\n` : '\nmọi shot đạt\n');
process.exitCode = failed ? 1 : 0;
