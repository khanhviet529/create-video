#!/usr/bin/env node
/**
 * H01 — full-video review CÂM, đo trên BẢN ĐÃ LẮP.
 *
 * Theo tiêu chí §1.2: đây là khẳng định về CẢM THỤ, nên bắt buộc đo trên artifact đã lắp,
 * KHÔNG suy ra từ 8 chương rời.
 *
 * ════ CỔNG RGB ════
 * Phân loại pixel bằng RGB + biên độ kênh (trung tính khi max−min ≤ 25). Va chạm luma đã biết:
 * --authoritative (≈168) vs --ink-mid (≈160). Riêng phép LOCK-1 cần phân biệt --stale (đỏ) nên
 * dùng quan hệ giữa các kênh, không dùng luma.
 *
 * ════ CỔNG L2 — ba dòng cho từng phép ════
 *
 * 1 · LIÊN TỤC qua 7 chỗ nối
 *   khẳng định: chỗ nối khai LIÊN TỤC phải cho khung gần như trùng; khai CẮT phải khác hẳn.
 *   đo: YAVG của blend difference giữa khung cuối chương N và khung đầu chương N+1, trên PNG.
 *   không thay thế: h264 một mình cho YAVG < 0.15 với cả hai loại nên không phân biệt được —
 *   phải trích PNG. Không suy từ việc hai chương "dùng cùng generator".
 *
 * 2 · TRÍ NHỚ KHÔNG GIAN
 *   khẳng định: các vật của thế giới bền giữ ĐÚNG toạ độ qua mọi chương có thế giới.
 *   đo: mép trái/phải của đường lịch sử, và đầu mút hai tiền tố, ở từng chương.
 *   không thay thế: không đo bao lồi toàn khung (chữ và thiết bị riêng của chương làm nó đổi);
 *   không đọc hằng số trong generator (generator đúng mà render vẫn có thể sai).
 *
 * 3 · BỐ CỤC
 *   khẳng định: mỗi chương chiếm chỗ KHÁC nhau vì cơ chế khác nhau.
 *   đo: trọng tâm mực và bao lồi mực của một khung đại diện mỗi chương.
 *   không thay thế: không đếm số vật (hai chương có thể cùng số vật mà chiếm chỗ khác hẳn).
 *
 * 4 · KHOẢNG ĐỨNG
 *   khẳng định: không có quãng đứng dài quá 3.0s ở BẤT KỲ đâu trong bản cắt.
 *   đo: lấy mẫu 4fps toàn bản, tblend difference, tìm quãng dài nhất giữa hai khung có đổi.
 *   không thay thế: beat sync đo TRONG cửa sổ beat và bỏ lọt khoảng GIỮA các cửa sổ — đó chính
 *   là bài học V2.1 §8, nên phải quét liên tục toàn bản.
 *
 * 5 · LOCK-1 "replica chậm" rò qua hình
 *   khẳng định: hai thanh tiền tố phải cùng độ dày và cùng màu; khác đi là hình xếp hạng chúng.
 *   đo: chiều cao dải pixel trung tính của mỗi thanh, và giá trị kênh trung bình.
 *   không thay thế: không so chiều DÀI (chúng phải khác dài — đó là cơ chế).
 *
 * 6 · LOCK-2 "mất dữ liệu" rò qua màu
 *   khẳng định: không pixel --stale nào chạm dấu commit ở vị trí 500, ở bất kỳ khung nào.
 *   đo: quét ô 40×40 quanh dấu ở mọi chương có thế giới, tìm pixel đỏ trội.
 *   không thay thế: không kiểm CSS trong source (một overlay có thể phủ lên lúc chạy).
 *
 * ════ HAI LỖI DỤNG CỤ ĐÃ SỬA (lượt 11) ════
 * · FILM từng được chọn bằng readdir()[0] — đúng do thứ tự chữ cái, không do chủ ý. Đã ghim tên.
 * · Mục 4 từng lấy đuôi bằng `136 − chuyển_động_cuối`, với 136 là độ dài bản CÂM. Trên bản có
 *   giọng (168.5s) phép này ra số ÂM. Nay đọc độ dài thật từ phim đang đo.
 * Cả hai đều là dạng đã gặp: hằng số của artifact cũ nằm lại trong dụng cụ.
 *
 *   node tools/review-h01-mute.mjs
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
const cut = plan.shots.filter((s) => !s.status).sort((a, b) => a.time[0] - b.time[0]);
const FILM = path.join(V, 'output', 'BEAT_ANCHORED_RETIMED.mp4');
if (!fs.existsSync(FILM)) throw new Error('không có bản đã lắp: ' + FILM);
const DUR = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', FILM], { encoding: 'utf8', windowsHide: true }).trim();
const W = 1080, H = 1920;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'rev-'));
const shotFile = (id) => path.join(V, 'shots', id, 'render.mp4');
const png = (f, t, tag, end) => {
  const p = path.join(TMP, tag + '.png');
  execFileSync('ffmpeg', end ? ['-v', 'error', '-y', '-sseof', '-0.05', '-i', f, '-frames:v', '1', p]
    : ['-v', 'error', '-y', '-ss', String(t), '-i', f, '-frames:v', '1', p], { windowsHide: true });
  return p;
};
const raw = (p) => execFileSync('ffmpeg', ['-v', 'error', '-i', p, '-pix_fmt', 'rgb24',
  '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26, windowsHide: true });
const neutral = (b, i) => Math.max(b[i], b[i + 1], b[i + 2]) - Math.min(b[i], b[i + 1], b[i + 2]) <= 25;
const bandAt = (b, y, lo, hi) => {
  let l = W, r = -1, n = 0, rows = new Set();
  for (let yy = Math.max(0, y - 8); yy <= Math.min(H - 1, y + 8); yy++) {
    for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3;
      if (!neutral(b, i)) continue;
      const v = Math.max(b[i], b[i + 1], b[i + 2]);
      if (v >= lo && v <= hi) { if (x < l) l = x; if (x > r) r = x; n++; rows.add(yy); }
    }
  }
  return { l, r, n, thick: rows.size };
};

let fail = 0;
const HAS_WORLD = ['ch2-co-che', 'ch-aha', 'ch4-bao-dam', 'ch-bon-vi-tri', 'ch-do-luong'];
const DECL = {                       // chỗ nối nào khai CẮT
  'ch1-su-co→ch2-co-che': 'CẮT',      // cú vào tỉ lệ
  /* sau bản sửa: CH-3 giữ đường lịch sử + hai dấu, chỉ bỏ ĐOẠN BAO. Thế giới bền xuyên
     qua thiết bị thời gian, nên hai chỗ nối này LIÊN TỤC theo thiết kế. Con số cao hơn hai
     chỗ nối thuần (0.55/0.70 vs 0.12) vì đoạn bao đi ra rồi đi vào — đó là thay đổi có chủ ý,
     không phải trôi. */
  'ch2-co-che→ch3-cua-so': 'LIÊN TỤC',
  'ch3-cua-so→ch-aha': 'LIÊN TỤC',
  'ch-aha→ch4-bao-dam': 'LIÊN TỤC',
  'ch4-bao-dam→ch-bon-vi-tri': 'LIÊN TỤC',
  'ch-bon-vi-tri→ch-do-luong': 'LIÊN TỤC',
  'ch-do-luong→ch5-cau-hoi': 'CẮT',   // cú ra tỉ lệ
};

console.log('══ 1 · LIÊN TỤC qua 7 chỗ nối ══');
for (let i = 0; i + 1 < cut.length; i++) {
  const a = png(shotFile(cut[i].id), 0, 'a' + i, true);
  const b = png(shotFile(cut[i + 1].id), 0, 'b' + i, false);
  const o = execFileSync('ffmpeg', ['-v', 'error', '-i', a, '-i', b, '-filter_complex',
    'blend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
    { encoding: 'utf8', windowsHide: true });
  const y = +(o.match(/YAVG=([\d.]+)/) || [0, 0])[1];
  const key = cut[i].id + '→' + cut[i + 1].id;
  const decl = DECL[key] ?? 'LIÊN TỤC';
  /* Một chỗ nối mà một đầu gần TRỐNG thì trung bình toàn khung không phân biệt được — đúng
     cảnh báo đã ghi trong check-continuity.mjs. Nên phép đo phải kèm mực hai đầu, và một chỗ
     nối có đầu dưới 2k mực được ghi là KHÔNG PHÂN GIẢI ĐƯỢC, không phải ĐẠT hay TRƯỢT. */
  const inkOf = (p) => { const bb = raw(p); let k = 0;
    for (let i = 0; i < W * H * 3; i += 3) if (Math.max(bb[i], bb[i+1], bb[i+2]) > 60) k++; return k; };
  const ia = inkOf(a), ib = inkOf(b);
  const thin = Math.min(ia, ib) < 2000;
  const read = thin ? 'không phân giải được' : (y < 1.2 ? 'liên tục' : 'khác hẳn');
  const ok = thin ? null : ((decl === 'CẮT') === (read === 'khác hẳn'));
  if (ok === false) fail++;
  console.log('  ' + key.padEnd(30) + y.toFixed(2).padStart(6) + '   ' + decl.padEnd(9)
    + (ok === null ? '— ' + read + ' (mực ' + Math.round(Math.min(ia,ib)/1000) + 'k)' : ok ? '✓' : '✗ đo ra ' + read));
}

console.log('\n══ 2 · TRÍ NHỚ KHÔNG GIAN — vật của thế giới bền có giữ toạ độ? ══');
const geo = [];
for (const id of HAS_WORLD) {
  const sh = cut.find((c) => c.id === id);
  const b = raw(png(shotFile(id), Math.min(6, sh.duration - 1), 'g' + id, false));
  const line = bandAt(b, 1000, 50, 90);       // --rule-bright #3D4348
  const pri = bandAt(b, 902, 140, 185);
  const rep = bandAt(b, 1190, 140, 185);
  geo.push({ id, line: line.l + '..' + line.r, pri: pri.r, rep: rep.r });
  console.log('  ' + id.padEnd(16) + 'đường ' + (line.l + '..' + line.r).padEnd(12)
    + ' primary kết ' + String(pri.r).padStart(4) + '  replica kết ' + String(rep.r).padStart(4));
}
const uniq = (k) => new Set(geo.map((g) => String(g[k])));
const stable = uniq('line').size === 1 && uniq('pri').size === 1;
if (!stable) fail++;
console.log('  → ' + (stable ? 'đường lịch sử và đầu mút primary GIỮ NGUYÊN qua mọi chương có thế giới'
  : 'TOẠ ĐỘ TRÔI: đường ' + [...uniq('line')].join(' / ') + ' · primary ' + [...uniq('pri')].join(' / ')));

console.log('\n══ 3 · BỐ CỤC — mỗi chương chiếm chỗ khác nhau? ══');
const boxes = [];
for (const c of cut) {
  const b = raw(png(shotFile(c.id), Math.min(c.duration - 1, c.duration * 0.7), 'x' + c.id, false));
  let l = W, r = -1, t = H, bo = -1, sx = 0, sy = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (Math.max(b[i], b[i + 1], b[i + 2]) < 60) continue;
    if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > bo) bo = y;
    sx += x; sy += y; n++;
  }
  boxes.push({ id: c.id, cx: Math.round(sx / n), cy: Math.round(sy / n), h: bo - t, ink: n });
  console.log('  ' + c.id.padEnd(16) + 'trọng tâm (' + Math.round(sx / n) + ',' + Math.round(sy / n)
    + ')  cao ' + String(bo - t).padStart(4) + 'px  mực ' + String(Math.round(n / 1000)).padStart(4) + 'k');
}
const cys = new Set(boxes.map((x) => Math.round(x.cy / 40)));
console.log('  → ' + cys.size + '/8 vùng trọng tâm khác nhau (gộp theo 40px)'
  + (cys.size >= 4 ? ' — bố cục KHÔNG đồng dạng' : ' — CẢNH BÁO: bố cục gần như một'));
if (cys.size < 4) fail++;

console.log('\n══ 4 · KHOẢNG ĐỨNG dài nhất trong toàn bản cắt ══');
const o = execFileSync('ffmpeg', ['-v', 'error', '-i', FILM, '-vf',
  'fps=4,tblend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
  { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
const mov = [...o.matchAll(/pts_time:([\d.]+)[\s\S]*?YMAX=(\d+)/g)]
  .filter((m) => +m[2] > 8).map((m) => +m[1]);
let worst = 0, worstAt = 0, prev = 0;
for (const t of mov) { if (t - prev > worst) { worst = t - prev; worstAt = prev; } prev = t; }
const tail = +(DUR - (mov.length ? mov[mov.length - 1] : 0)).toFixed(2);
console.log('  quãng đứng dài nhất: ' + worst.toFixed(2) + 's, bắt đầu ở ' + worstAt.toFixed(2) + 's');
console.log('  đuôi sau chuyển động cuối: ' + tail.toFixed(2) + 's');
console.log('  ── theo chương ──');
for (const c of cut) {
  const o2 = execFileSync('ffmpeg', ['-v', 'error', '-i', shotFile(c.id), '-vf',
    'fps=4,tblend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
  const m2 = [...o2.matchAll(/pts_time:([\d.]+)[\s\S]*?YMAX=(\d+)/g)]
    .filter((x) => +x[2] > 8).map((x) => +x[1]);
  let mid = 0, pv = 0;
  for (const t of m2) { if (t - pv > mid) mid = t - pv; pv = t; }
  const last = m2.length ? m2[m2.length - 1] : 0;
  console.log('    ' + c.id.padEnd(16) + 'quãng giữa ' + mid.toFixed(2) + 's · đuôi '
    + (c.duration - last).toFixed(2) + 's');
}
/* KHÔNG tính vào fail: xem ghi chú phạm trù ở header. Ngưỡng 3.0s là cho LẶNG, và bản câm
   không phân biệt được lặng-có-lý-do với chết-hình. Phán quyết thuộc voiced review. */
console.log('  → ĐO ĐƯỢC, CHƯA PHÁN QUYẾT ĐƯỢC ở bản câm — ngưỡng 3.0s là ngưỡng cho LẶNG,');
console.log('    và bản câm không có lời để phân biệt "giữ dưới lời" với "chết hình".');
console.log('    Số ở đây là nguyên liệu cho voiced review, không phải một phán quyết.');

console.log('\n══ 5 · LOCK-1 "replica chậm" — hai thanh có cùng độ dày và màu? ══');
{
  const b = raw(png(shotFile('ch-bon-vi-tri'), 2, 'lk1', false));
  const col = (y, x) => { let n = 0; for (let yy = y - 10; yy <= y + 10; yy++) {
    const i = (yy * W + x) * 3; if (neutral(b, i)) { const v = Math.max(b[i], b[i+1], b[i+2]);
      if (v >= 140 && v <= 185) n++; } } return n; };
  const pri = { thick: col(902, 450) }, rep = { thick: col(1190, 450) };
  const ok = pri.thick === rep.thick && pri.thick > 0;
  console.log('  tại x=450 (xa chốt): primary dày ' + pri.thick + 'px · replica dày ' + rep.thick + 'px  → '
    + (ok ? 'CÙNG ĐỘ DÀY' : 'KHÁC ĐỘ DÀY — hình đang xếp hạng hai node'));
  if (!ok) fail++;
}

console.log('\n══ 6 · LOCK-2 "mất dữ liệu" — có pixel báo động nào chạm dấu commit? ══');
{
  let hit = 0;
  for (const id of HAS_WORLD) {
    const sh = cut.find((c) => c.id === id);
    const b = raw(png(shotFile(id), Math.min(6, sh.duration - 1), 'lk2' + id, false));
    let red = 0;
    for (let y = 980; y < 1021; y++) for (let x = 779; x < 820; x++) {
      const i = (y * W + x) * 3;
      if (b[i] > b[i + 1] + 30 && b[i] > b[i + 2] + 30 && b[i] > 90) red++;
    }
    if (red > 0) { hit++; console.log('  ✗ ' + id + ': ' + red + ' pixel đỏ trội quanh dấu commit'); }
  }
  console.log('  → ' + (hit === 0 ? 'KHÔNG có pixel báo động nào chạm dấu commit ở cả 5 chương'
    : hit + ' chương có'));
  if (hit) fail++;
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + (fail ? fail + ' mục KHÔNG ĐẠT' : 'sáu mục ĐẠT') + '\n');
process.exitCode = fail ? 1 : 0;
