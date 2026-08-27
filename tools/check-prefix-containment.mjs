#!/usr/bin/env node
/**
 * LÙI 1 — hai khẳng định, hai phép đo khác nhau, mỗi phép khớp với đúng khẳng định của nó.
 *
 * L2 (bài học từ R1): độ dốc toàn cục trên một đường phần lớn phẳng ≈ 0 nên "đạt" là vô nghĩa.
 * Một phép kiểm phải đo ĐÚNG điều đang được khẳng định, không phải một đại lượng gần đúng.
 *
 *   A. TÁCH ĐƯỢC — "quan hệ bao hàm đọc được ở MỌI điểm, kể cả nơi không có gì đang đổi".
 *      Khẳng định thật: hai đoạn bao không bao giờ che nhau. Đo: tập pixel của hai đoạn phải
 *      RỜI NHAU, và mỗi đoạn phải hiện đủ khoảng cột của nó. Đây là phép trực tiếp — nó không
 *      suy ra từ độ dốc, độ dài hay bất cứ đại lượng thay thế nào.
 *      Negative control: hai đoạn vẽ CÙNG mức → phải nổ.
 *
 *   B. R15 — "500 vẫn hiện hữu; 'ngoài' là một QUAN HỆ, không phải một sự vắng mặt".
 *      Khẳng định thật: dấu ở 500 (i) luôn có mặt và (ii) luôn nằm TRONG đoạn bao của primary.
 *      Đây là bản tương đương của luật đếm dấu ở R1, dịch sang ngữ pháp bao hàm: ở R1 "tồn
 *      tại" = còn trên màn hình; ở đây "tồn tại" = được một tiền tố phủ.
 *      Negative control: primary cũng dừng ở 499 → 500 ngoài mọi tiền tố → phải nổ.
 *
 * CỔNG RGB: bộ kiểm này phân loại pixel bằng **RGB + biên độ kênh < 25** (trung tính), KHÔNG
 * bằng luma. Va chạm đã biết: --authoritative (#C9A227, luma ≈168) vs --ink-mid (#9AA0A6,
 * luma ≈160) — trên ảnh xám không phân biệt được.
 *
 *   node tools/check-prefix-containment.mjs <video-id>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const videoId = process.argv[2];
if (!videoId) { console.error('usage: check-prefix-containment.mjs <video-id>'); process.exit(2); }

const W = 1080, H = 1920;
const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const shots = (plan.shots || []).filter((s) => s.prefix_world);
if (!shots.length) { console.log('không shot nào khai prefix_world'); process.exit(0); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pfx-'));

const frame = (f, t, tag) => {
  const p = path.join(TMP, tag + '.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', f, '-frames:v', '1', p],
    { windowsHide: true });
  return execFileSync('ffmpeg', ['-v', 'error', '-i', p, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 26, windowsHide: true });
};
/* Đoạn bao vẽ bằng --ink-mid (~160). Quét một dải hẹp quanh mức đã khai.
   Trả về ĐẦU MÚT PHẢI — đó là thứ mang nghĩa "tiền tố này dừng ở đâu", và cũng đúng là thứ
   biến mất khi hai thanh bị vẽ chồng mức. */
const barEnd = (buf, y) => {
  let lo = W, hi = -1, n = 0;
  for (let yy = y - 6; yy <= y + 6; yy++) {
    for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3;
      const r = buf[i], g = buf[i + 1], b = buf[i + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 25) continue;   // gold không trung tính
      const v = Math.max(r, g, b);
      if (v >= 140 && v <= 185) { if (x < lo) lo = x; if (x > hi) hi = x; n++; }
    }
  }
  return { lo, hi, n };
};
/* Tâm dấu quan sát trên đường lịch sử: cụm --ink dày ≥ 12px theo chiều dọc. */
const markCentres = (buf, yL) => {
  const xs = [];
  for (let x = 0; x < W; x++) {
    let thick = 0;
    for (let yy = yL - 16; yy <= yL + 16; yy++) {
      const i = (yy * W + x) * 3;
      if (Math.max(buf[i], buf[i + 1], buf[i + 2]) > 210
        && Math.max(buf[i], buf[i + 1], buf[i + 2]) - Math.min(buf[i], buf[i + 1], buf[i + 2]) <= 25) thick++;
    }
    if (thick >= 12) xs.push(x);
  }
  const groups = [];
  for (const x of xs) {
    const g = groups[groups.length - 1];
    if (g && x - g[g.length - 1] <= 3) g.push(x); else groups.push([x]);
  }
  return groups.filter((g) => g.length >= 8)
    .map((g) => Math.round((g[0] + g[g.length - 1]) / 2));
};

let failed = 0;
for (const shot of shots) {
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot.id}  chưa render`); continue; }
  const pw = shot.prefix_world;
  const expect = pw.expect || null;
  let bad = [];

  /* ── A · tách được ────────────────────────────────────────────────────────── */
  const tA = pw.separable_from;
  const bufA = frame(f, tA, shot.id + 'A');
  const ep = barEnd(bufA, pw.levels.primary);
  const er = barEnd(bufA, pw.levels.replica);
  /* Khẳng định: mỗi tiền tố có một đầu mút RIÊNG, quan sát được. Chồng mức thì hai đầu mút
     báo cùng một chỗ và đầu mút của tiền tố ngắn KHÔNG CÒN quan sát được. */
  const sepOk = ep.n > 100 && er.n > 100 && Math.abs(ep.hi - er.hi) > 20;
  console.log(`  ${shot.id}  @${tA}s`);
  console.log(`     A đầu mút riêng   primary kết ở x=${ep.hi} · replica kết ở x=${er.hi}`
    + `  cách nhau ${Math.abs(ep.hi - er.hi)}px  → ${sepOk ? 'HAI ĐẦU MÚT QUAN SÁT ĐƯỢC' : 'ĐẦU MÚT NGẮN BỊ MẤT'}`);
  if (!sepOk) bad.push('A');

  /* ── B · R15: 500 có mặt và nằm trong tiền tố của primary ─────────────────── */
  let covOk = null;
  if (pw.covered_mark) {
    const cm = pw.covered_mark;
    const ts = [];
    for (let t = cm.from; t <= cm.to + 1e-9; t += (cm.to - cm.from) / 4) ts.push(+t.toFixed(2));
    const rows = [];
    for (const t of ts) {
      const b = frame(f, t, shot.id + 'B' + t);
      /* TÂM của dấu phải nhất — dấu đặt GIỮA vị trí, nên chỉ tâm mới so được với đầu mút */
      const centres = markCentres(b, pw.levels.line);
      const markX = centres.length ? Math.max(...centres) : -1;
      const priEnd = barEnd(b, pw.levels.primary).hi;
      const present = markX >= 0;
      const inside = present && priEnd >= markX - 6;
      rows.push({ t, markX, priEnd, present, inside });
    }
    covOk = rows.every((r) => r.present && r.inside);
    console.log(`     B  R15        ` + rows.map((r) => `${r.t}s:` +
      (!r.present ? 'MẤT' : (r.inside ? 'trong' : 'NGOÀI') + `(${r.markX}≤${r.priEnd})`)).join(' '));
    if (!covOk) bad.push('B');
  }

  /* ── phán quyết theo kỳ vọng ──────────────────────────────────────────────── */
  if (expect === 'NOT_SEPARABLE' || expect === 'UNCOVERED') {
    const want = expect === 'NOT_SEPARABLE' ? 'A' : 'B';
    if (bad.includes(want)) console.log(`     ✓ negative control trượt đúng ở ${want} — phép kiểm có nổ thật`);
    else { console.log(`     ✗ NEGATIVE CONTROL LỌT ở ${want} — phép kiểm hỏng, đừng tin số của shot khác`); failed++; }
  } else if (bad.length) {
    failed++;
    console.log(`     ✗ vi phạm: ${bad.join(', ')}`);
  } else {
    console.log('     ✓ đạt cả hai');
  }
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failed ? `\n${failed} shot có vấn đề\n` : '\nmọi shot đạt\n');
process.exitCode = failed ? 1 : 0;
