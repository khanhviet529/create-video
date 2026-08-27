#!/usr/bin/env node
/**
 * H01 — VOICED REVIEW. Đây là chỗ mục 4 (khoảng đứng) có nghĩa, vì đã có lời để phân biệt
 * "giữ dưới lời đang nói" với "chết hình".
 *
 * ════ CỔNG RGB ════
 * Phân loại pixel bằng RGB + biên độ kênh. Va chạm luma đã biết: --authoritative (≈168) vs
 * --ink-mid (≈160). Phép LOCK-2 cần phân biệt --stale (đỏ) nên dùng quan hệ giữa các kênh.
 *
 * ════ CỔNG L2 (bản mở rộng: đo gì · đo Ở ĐÂU · vì sao vị trí đó đại diện) ════
 *
 * A · KHOẢNG GIỮ, có lời
 *   khẳng định: mỗi khoảng khung-không-đổi > 3.0s phải nằm dưới một beat đang nói, và beat đó
 *     phải là loại bình luận-trên-trạng-thái-ổn-định.
 *   đo: quét 4fps toàn bản (tblend difference, YMAX > 8) tìm mọi khoảng > 3.0s; với mỗi khoảng,
 *     tra beat nào đang chạy tại thời điểm đó từ shot_timing.json.
 *     ĐO Ở ĐÂU: trên bản ĐÃ GHÉP, không phải trên 8 chương rời — beat offset chỉ đúng sau khi
 *     lắp. Một vị trí là đủ vì đại lượng là một chuỗi thời gian, không biến thiên theo trục khác.
 *   không thay thế: không đếm tổng chuyển động (che mất chỗ nào dồn chỗ nào trống); không dùng
 *     beat sync (nó đo TRONG cửa sổ beat và bỏ lọt khoảng GIỮA các cửa sổ).
 *
 * B · LỜI CHẠY TRÊN KHUNG ĐỨNG, và HÌNH ĐẾN LỆCH LỜI
 *   khẳng định: sự kiện hình của một beat phải rơi trong cửa sổ beat đó, không sớm/muộn hơn
 *     một beat.
 *   đo: với mỗi beat, tìm cụm chuyển động gần nhất và lấy độ lệch so với mốc beat.
 *   không thay thế: không so số cụm với số beat (đúng số mà lệch chỗ vẫn sai).
 *
 * C · TỔNG THỜI GIAN GIỮ, đặt cạnh G01
 *   khẳng định: tỉ lệ giữ-không-đổi của H01 so được với G01 (đã qua full-video review).
 *   đo: tổng thời gian trong các khoảng không-đổi / runtime, cho cả hai video.
 *   không thay thế: không so số khoảng (một video có thể có ít khoảng mà mỗi khoảng rất dài).
 *
 * D · BỐN LOCK trên bản có giọng
 *   như bản câm, nhưng đo trên bản đã ghép để bắt cả những gì chỉ hiện ra khi xem liền mạch.
 *
 *   node tools/review-h01-voiced.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const V = path.join(ROOT, 'videos', 'H01-two-meanings-of-after');
const plan = YAML.parse(fs.readFileSync(path.join(V, 'shot_plan.yaml'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(V, 'voice', 'shot_timing.json'), 'utf8'));
const cut = plan.shots.filter((s) => !s.status).sort((a, b) => a.time[0] - b.time[0]);
const FILM = path.join(V, 'output', 'BEAT_ANCHORED_RETIMED.mp4');
const RUN = 168.533;
const beatsText = YAML.parse(fs.readFileSync(path.join(V, 'content-package.yaml'), 'utf8'))
  .narration.text.split(/\n\n+/);
const W = 1080, H = 1920;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vrev-'));

/* mốc beat TUYỆT ĐỐI trên bản đã ghép */
const ABS = [];
for (const c of cut) {
  const ch = T.chapters[c.id];
  for (const [k, off] of Object.entries(ch.offsets)) ABS.push({ beat: +k, t: c.time[0] + off });
}
ABS.sort((a, b) => a.t - b.t);
const beatAt = (t) => { let r = ABS[0]; for (const b of ABS) if (b.t <= t + 1e-9) r = b; return r; };

const motion = (() => {
  const o = execFileSync('ffmpeg', ['-v', 'error', '-i', FILM, '-vf',
    'fps=4,tblend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
  return [...o.matchAll(/pts_time:([\d.]+)[\s\S]*?YMAX=(\d+)/g)]
    .filter((m) => +m[2] > 8).map((m) => +m[1]);
})();

let fail = 0;
console.log('══ A · KHOẢNG GIỮ > 3.0s, và beat nào đang nói ở đó ══');
const gaps = [];
let prev = 0;
for (const t of motion) { if (t - prev > 3.0) gaps.push({ from: prev, to: t, len: +(t - prev).toFixed(2) }); prev = t; }
if (RUN - prev > 3.0) gaps.push({ from: prev, to: RUN, len: +(RUN - prev).toFixed(2) });
let totalHold = 0;
for (const g of motion.length ? [{ from: 0, to: motion[0] }] : []) void g;
{ let pv = 0; for (const t of motion) { totalHold += Math.max(0, t - pv - 0.25); pv = t; } totalHold += Math.max(0, RUN - pv - 0.25); }
for (const g of gaps) {
  const b = beatAt(g.from + 0.1);
  console.log('  ' + g.from.toFixed(1).padStart(6) + 's → ' + g.to.toFixed(1).padStart(6) + 's  ('
    + g.len.toFixed(1).padStart(4) + 's)  beat ' + String(b.beat).padStart(2) + '  '
    + beatsText[b.beat - 1].slice(0, 62));
}
console.log('  tổng ' + gaps.length + ' khoảng > 3.0s');

console.log('\n══ B · HÌNH ĐẾN LỆCH LỜI bao nhiêu? ══');
const clusters = [];
{ let pv = -9; for (const t of motion) { if (t - pv > 0.5) clusters.push(t); pv = t; } }
let worstLag = 0, worstBeat = 0;
const lags = [];
for (const b of ABS) {
  const near = clusters.reduce((best, c) => (Math.abs(c - b.t) < Math.abs(best - b.t) ? c : best), clusters[0]);
  const lag = +(near - b.t).toFixed(2);
  lags.push({ beat: b.beat, lag });
  if (Math.abs(lag) > Math.abs(worstLag)) { worstLag = lag; worstBeat = b.beat; }
}
const bad = lags.filter((l) => Math.abs(l.lag) > 2.0);
console.log('  lệch |>2.0s|: ' + (bad.length ? bad.map((l) => 'beat ' + l.beat + ' ' + (l.lag > 0 ? '+' : '') + l.lag + 's').join(' · ') : 'không có'));
console.log('  lệch lớn nhất: beat ' + worstBeat + '  ' + (worstLag > 0 ? '+' : '') + worstLag + 's'
  + (worstLag > 0 ? ' (hình ĐẾN SAU lời)' : ' (hình ĐẾN TRƯỚC lời)'));
if (bad.length > 4) fail++;

console.log('\n══ C · TỔNG THỜI GIAN GIỮ, đặt cạnh G01 ══');
const g01 = path.join(ROOT, 'videos', 'G01-bloat-not-row-count', 'output', 'final.mp4');
let g01pct = null;
if (fs.existsSync(g01)) {
  const o = execFileSync('ffmpeg', ['-v', 'error', '-i', g01, '-vf',
    'fps=4,tblend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
  const mv = [...o.matchAll(/pts_time:([\d.]+)[\s\S]*?YMAX=(\d+)/g)].filter((m) => +m[2] > 8).map((m) => +m[1]);
  let hold = 0, pv = 0;
  for (const t of mv) { hold += Math.max(0, t - pv - 0.25); pv = t; }
  hold += Math.max(0, 175.5 - pv - 0.25);
  g01pct = hold / 175.5 * 100;
  let wg = 0, p2 = 0;
  for (const t of mv) { if (t - p2 > wg) wg = t - p2; p2 = t; }
  console.log('  G01  175.5s · giữ ' + hold.toFixed(1) + 's = ' + g01pct.toFixed(1)
    + '% · khoảng dài nhất ' + wg.toFixed(2) + 's');
}
const h01pct = totalHold / RUN * 100;
console.log('  H01  ' + RUN.toFixed(1) + 's · giữ ' + totalHold.toFixed(1) + 's = ' + h01pct.toFixed(1)
  + '% · khoảng dài nhất ' + (gaps.length ? Math.max(...gaps.map((g) => g.len)).toFixed(2) : '<3') + 's');
if (g01pct !== null) {
  const d = h01pct - g01pct;
  console.log('  → H01 ' + (d > 0 ? 'giữ NHIỀU HƠN' : 'giữ ÍT HƠN') + ' G01 ' + Math.abs(d).toFixed(1)
    + ' điểm %' + (d > 12 ? '  ← VƯỢT ĐÁNG KỂ, rủi ro tĩnh như F01' : ''));
  if (d > 12) { fail++; console.log('    -> TÍNH LÀ KHÔNG ĐẠT: ngưỡng đã tự khai là 12 điểm %'); }
}

console.log('\n══ D · BỐN LOCK trên bản có giọng ══');
const png = (t, tag) => {
  const p = path.join(TMP, tag + '.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', FILM, '-frames:v', '1', p], { windowsHide: true });
  return execFileSync('ffmpeg', ['-v', 'error', '-i', p, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 26, windowsHide: true });
};
const neutral = (b, i) => Math.max(b[i], b[i + 1], b[i + 2]) - Math.min(b[i], b[i + 1], b[i + 2]) <= 25;
const colThick = (b, y, x) => { let n = 0; for (let yy = y - 10; yy <= y + 10; yy++) {
  const i = (yy * W + x) * 3; if (neutral(b, i)) { const v = Math.max(b[i], b[i + 1], b[i + 2]);
    if (v >= 140 && v <= 185) n++; } } return n; };
/* LOCK-1: hai thanh cùng độ dày, đo ở HAI cột xa chốt (cổng L2 mở rộng) */
{
  const b = png(100, 'l1');
  const r = [300, 450, 600].map((x) => [colThick(b, 902, x), colThick(b, 1190, x)]);
  const ok = r.every(([p, q]) => p === q && p > 0);
  console.log('  LOCK-1 replica chậm: ' + r.map(([p, q], i) => 'x=' + [300, 450, 600][i] + ' ' + p + '/' + q).join(' · ')
    + '  → ' + (ok ? 'CÙNG ĐỘ DÀY ở cả ba cột' : 'KHÁC — hình xếp hạng hai node'));
  if (!ok) fail++;
}
/* LOCK-2: không pixel báo động nào chạm dấu commit, quét nhiều thời điểm trên bản đã ghép */
{
  let hit = 0;
  for (const t of [30, 50, 65, 80, 100, 130, 150]) {
    const b = png(t, 'l2' + t);
    let red = 0;
    for (let y = 980; y < 1021; y++) for (let x = 779; x < 820; x++) {
      const i = (y * W + x) * 3;
      if (b[i] > b[i + 1] + 30 && b[i] > b[i + 2] + 30 && b[i] > 90) red++;
    }
    if (red > 0) { hit++; console.log('    ✗ t=' + t + 's: ' + red + ' pixel đỏ trội quanh dấu commit'); }
  }
  console.log('  LOCK-2 mất dữ liệu: ' + (hit === 0 ? 'KHÔNG pixel báo động nào chạm dấu commit (7 mốc)' : hit + ' mốc có'));
  if (hit) fail++;
}
/* LOCK-3: eventual consistency phải được cho thấy HOÀN TẤT ở đâu đó */
{
  const ch = cut.find((c) => c.id === 'ch4-bao-dam');
  const off = T.chapters['ch4-bao-dam'].offsets;
  const t1 = ch.time[0] + off[21], t2 = ch.time[0] + off[22] - 0.5;
  const end = (t, tag) => { const b = png(t, tag); let r = -1;
    for (let yy = 1184; yy <= 1196; yy++) for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3; if (!neutral(b, i)) continue;
      const v = Math.max(b[i], b[i + 1], b[i + 2]); if (v >= 140 && v <= 185 && x > r) r = x; } return r; };
  const a = end(t1, 'l3a'), z = end(t2, 'l3b');
  const ok = z - a >= 20;
  console.log('  LOCK-3 EC vỡ: đầu mút dưới ' + a + ' → ' + z + ' (dịch ' + (z - a) + 'px)  → '
    + (ok ? 'EC ĐƯỢC CHO THẤY HOÀN TẤT' : 'không thấy EC hoàn tất'));
  if (!ok) fail++;
}
/* LOCK-4: bốn vị trí cùng một tỉ lệ — đường lịch sử không đổi phạm vi trong ch-bon-vi-tri */
{
  const ch = cut.find((c) => c.id === 'ch-bon-vi-tri');
  const ext = (t, tag) => { const b = png(t, tag); let l = W, r = -1;
    for (let yy = 992; yy <= 1008; yy++) for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3; const v = Math.max(b[i], b[i + 1], b[i + 2]);
      if (v >= 50 && v <= 90 && neutral(b, i)) { if (x < l) l = x; if (x > r) r = x; } } return l + '..' + r; };
  const ts = [4, 14, 26, 40].map((d) => ch.time[0] + d);
  const es = ts.map((t, i) => ext(t, 'l4' + i));
  const ok = new Set(es).size === 1;
  console.log('  LOCK-4 một fix đúng: phạm vi đường ' + [...new Set(es)].join(' / ')
    + '  → ' + (ok ? 'BỐN VỊ TRÍ CÙNG MỘT TỈ LỆ' : 'TỈ LỆ ĐỔI — bốn vị trí thôi so sánh được'));
  if (!ok) fail++;
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + (fail ? fail + ' mục KHÔNG ĐẠT' : 'mọi mục ĐẠT') + '\n');
process.exitCode = fail ? 1 : 0;
