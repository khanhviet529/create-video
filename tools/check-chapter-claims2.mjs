#!/usr/bin/env node
/**
 * H01 — hai khẳng định của năm chương còn lại. Mỗi phép kèm negative control.
 *
 * ════ CỔNG RGB ════
 * Phân loại pixel bằng **RGB + biên độ kênh** (trung tính khi max−min ≤ 25), KHÔNG bằng luma.
 * Bảng va chạm luma đã biết: --authoritative (#C9A227, ≈168) vs --ink-mid (#9AA0A6, ≈160).
 * Bổ sung lượt này: --ink (#EDEAE4, ≈235) vs nền trắng của không có gì — không va chạm.
 *
 * ════ CỔNG L2 ════
 *
 * D · R4 · HAI LOẠI KHẲNG ĐỊNH (không phải hai trạng thái của một thang)
 *   1. Khẳng định: bằng chứng cho read-your-writes là một quan hệ TĨNH giữa hai dấu (không gì
 *      chuyển động); bằng chứng cho eventual consistency là một CHUYỂN ĐỘNG hoàn tất (đầu mút
 *      tiền tố đi tới nơi). Hai LOẠI bằng chứng khác nhau ⇒ không gộp được thành bật/tắt.
 *   2. Đại lượng đo: dịch chuyển của ĐẦU MÚT tiền tố trong mỗi cửa sổ — ≈ 0 ở cửa sổ tĩnh,
 *      ≥ 20px ở cửa sổ chuyển động.
 *   3. Vì sao KHÔNG phải thay thế: "loại bằng chứng" ở đây được dựng ra bằng CÓ hay KHÔNG có
 *      chuyển động của đúng vật đó, nên đo dịch chuyển của nó là đo đúng khẳng định. Không đo
 *      mực toàn khung (hai thanh 4px dịch 185px chỉ đổi vài phần nghìn số pixel — đã sai một
 *      lần vì thế); không đọc tham số animation trong source.
 *
 * E · CẶP 1 · HAI KHOẢNG LỒNG NHAU
 *   1. Khẳng định: hai khoảng XUẤT PHÁT cùng một mốc, và khoảng trong KẾT THÚC BÊN TRONG
 *      khoảng ngoài. Cùng quan hệ trong/ngoài với thế giới nền.
 *   2. Đại lượng đo: mép trái và mép phải của mỗi khoảng, ở mức y riêng của nó.
 *   3. Vì sao KHÔNG phải thay thế: "chồng lên nhau" ở đây CHÍNH LÀ quan hệ giữa hai mép phải
 *      khi hai mép trái trùng. Không đo diện tích (một khoảng dày hơn vẫn có thể kết thúc ngoài);
 *      không đo tỉ lệ chiều dài trong source.
 *
 *   node tools/check-chapter-claims2.mjs <video-id>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const videoId = process.argv[2];
if (!videoId) { console.error('usage: check-chapter-claims2.mjs <video-id>'); process.exit(2); }
const W = 1080;
const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ch2-'));

const rgb = (f, t, tag) => {
  const p = path.join(TMP, tag + '.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', f, '-frames:v', '1', p],
    { windowsHide: true });
  return execFileSync('ffmpeg', ['-v', 'error', '-i', p, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 26, windowsHide: true });
};
const neutral = (b, i) => Math.max(b[i], b[i + 1], b[i + 2]) - Math.min(b[i], b[i + 1], b[i + 2]) <= 25;
/* mép trái / mép phải của một dải nằm ngang ở mức y, chỉ tính pixel TRUNG TÍNH đủ sáng */
const band = (buf, y, lo, hi) => {
  let l = W, r = -1, n = 0;
  for (let yy = y - 6; yy <= y + 6; yy++) {
    for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3;
      if (!neutral(buf, i)) continue;
      const v = Math.max(buf[i], buf[i + 1], buf[i + 2]);
      if (v >= lo && v <= hi) { if (x < l) l = x; if (x > r) r = x; n++; }
    }
  }
  return { l, r, n };
};

let failed = 0;
for (const shot of plan.shots || []) {
  if (!shot.two_kinds && !shot.nested_spans) continue;
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  if (!fs.existsSync(f)) { console.log(`  ?  ${shot.id}  chưa render`); continue; }
  console.log(`  ${shot.id}`);
  let bad = null, expect = null;

  if (shot.two_kinds) {
    const tk = shot.two_kinds;
    expect = tk.expect || expect;
    const endAt = (t, tag) => band(rgb(f, t, shot.id + tag), tk.levels.replica, 140, 185).r;
    const moved = (w, tag) => Math.abs(endAt(w[1], tag + 'b') - endAt(w[0], tag + 'a'));
    const mStatic = moved(tk.static_claim.window, 's');
    const mMotion = moved(tk.motion_claim.window, 'm');
    const ok = mStatic <= 3 && mMotion >= 20;
    console.log(`     D  R4  ${tk.static_claim.name}: đầu mút dịch ${mStatic}px `
      + `(cần ≤3 — bằng chứng TĨNH)`);
    console.log(`             ${tk.motion_claim.name}: đầu mút dịch ${mMotion}px `
      + `(cần ≥20 — bằng chứng CHUYỂN ĐỘNG)`);
    console.log(`             → ${ok ? 'HAI LOẠI BẰNG CHỨNG KHÁC NHAU' : 'CÙNG MỘT LOẠI — đã thành thang bật/tắt'}`);
    if (!ok) bad = 'D';
  }

  if (shot.nested_spans) {
    const ns = shot.nested_spans;
    expect = ns.expect || expect;
    const b = rgb(f, ns.at, shot.id + 'ns');
    const out = band(b, ns.levels.outer_y, 140, 185);   // --ink-mid
    const inn = band(b, ns.levels.inner_y, 200, 255);   // --ink
    const sameOrigin = Math.abs(out.l - inn.l) <= 6;
    const innerInside = inn.r < out.r - 10;
    const ok = out.n > 100 && inn.n > 100 && sameOrigin && innerInside;
    console.log(`     E  cặp1  khoảng ngoài x ${out.l}..${out.r} · khoảng trong x ${inn.l}..${inn.r}`);
    console.log(`             cùng mốc xuất phát: ${sameOrigin ? 'CÓ' : 'KHÔNG'} (lệch ${Math.abs(out.l - inn.l)}px)`
      + ` · mép phải trong < ngoài: ${innerInside ? 'CÓ' : 'KHÔNG'}`);
    console.log(`             → ${ok ? 'KHOẢNG TRONG KẾT THÚC BÊN TRONG KHOẢNG NGOÀI' : 'KHÔNG LỒNG NHAU'}`);
    if (!ok) bad = 'E';
  }

  if (expect) {
    if (bad) console.log(`     ✓ negative control trượt đúng ở ${bad} — phép kiểm có nổ thật`);
    else { console.log('     ✗ NEGATIVE CONTROL LỌT — phép kiểm hỏng'); failed++; }
  } else if (bad) { failed++; console.log(`     ✗ vi phạm ${bad}`); } else console.log('     ✓ đạt');
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failed ? `\n${failed} shot có vấn đề\n` : '\nmọi shot đạt\n');
process.exitCode = failed ? 1 : 0;
