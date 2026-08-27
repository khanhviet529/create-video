#!/usr/bin/env node
/**
 * H01 — ba khẳng định của bản dựng chương. Mỗi phép có negative control riêng.
 *
 * ════ CỔNG THỦ TỤC L2 — khai trước khi chạy, cho từng phép ════
 *
 * A · R18 · IM LẶNG VỀ HỆ QUY CHIẾU
 *   1. Khẳng định: trong cửa sổ beat 17 (lời nói theo hệ ĐỒNG HỒ), hình KHÔNG phát biểu hệ
 *      VỊ TRÍ — tức không đoạn bao nào hiện trên màn hình.
 *   2. Đại lượng đo: số pixel `--ink-mid` trong dải ±6px quanh MỖI mức đoạn bao, ở nhiều mốc
 *      trải suốt cửa sổ; đòi 0 ở mọi mốc trong cửa sổ, và > 0 sau khi cửa sổ đóng.
 *   3. Vì sao KHÔNG phải thay thế: khẳng định là "đoạn bao không có mặt", và đoạn bao có mặt
 *      hay không CHÍNH LÀ số pixel của nó ở mức của nó. Không suy từ opacity trong source
 *      (source đúng mà render vẫn có thể sai), không suy từ tổng mực toàn khung (dấu và chữ
 *      số cũng đóng góp mực).
 *
 * B · R14 · CÂU ĐỌC THỨ HAI ĐÁP Ở ĐÂU
 *   1. Khẳng định: câu đọc thứ hai được tiền tố DƯỚI phục vụ, và tiền tố đó vẫn dừng ở 499 —
 *      tức "hiện luôn giá trị vừa gửi" KHÔNG sửa gì trong hệ thống.
 *   2. Đại lượng đo: sợi phục vụ (`--boundary`) nằm ở nửa DƯỚI hay nửa TRÊN đường lịch sử;
 *      cộng đầu mút của tiền tố dưới.
 *   3. Vì sao KHÔNG phải thay thế: "được tiền tố nào phục vụ" được vẽ ra bằng CHIỀU của sợi,
 *      nên đo chiều của sợi là đo đúng khẳng định. Không suy từ vị trí dấu (dấu ở 499 trong
 *      cả hai trường hợp đúng và sai — nó không phân biệt được gì).
 *
 * C · R12 · CÙNG SỐ ĐỌC, HAI THẾ GIỚI
 *   1. Khẳng định — HAI mệnh đề: (i) bề rộng khe hở BẰNG NHAU ở hai thế giới, VÀ (ii) hai thế
 *      giới khác nhau ở CHUYỂN ĐỘNG. Bản đầu chỉ đo (i); (ii) mới là mệnh đề mang bài học
 *      signal ≠ diagnosis, và đo thiếu một mệnh đề cũng là đo-đại-lượng-thay-thế.
 *   2. Đại lượng đo: khoảng cách hai đầu mút ở hai mốc; CỘNG mật độ đổi khung quanh mỗi mốc.
 *   3. Vì sao KHÔNG phải thay thế: "số đọc" của replay_lag CHÍNH LÀ khoảng cách hai đầu mút
 *      trong thế giới này. Không suy từ độ dài thanh (thanh dài ra khi cả hai cùng tiến mà
 *      khoảng cách không đổi).
 *
 *   node tools/check-chapter-claims.mjs <video-id>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const videoId = process.argv[2];
if (!videoId) { console.error('usage: check-chapter-claims.mjs <video-id>'); process.exit(2); }
const W = 1080;
const vdir = path.join(ROOT, 'videos', videoId);
const plan = YAML.parse(fs.readFileSync(path.join(vdir, 'shot_plan.yaml'), 'utf8'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'chap-'));

const rgb = (f, t, tag) => {
  const p = path.join(TMP, tag + '.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', f, '-frames:v', '1', p],
    { windowsHide: true });
  return execFileSync('ffmpeg', ['-v', 'error', '-i', p, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    { maxBuffer: 1 << 26, windowsHide: true });
};
const barPix = (buf, y) => {
  let n = 0, hi = -1;
  for (let yy = y - 6; yy <= y + 6; yy++) {
    for (let x = 0; x < W; x++) {
      const i = (yy * W + x) * 3;
      const r = buf[i], g = buf[i + 1], b = buf[i + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 25) continue;   // không trung tính -> không phải đoạn bao
      const v = Math.max(r, g, b);
      if (v >= 140 && v <= 185) { n++; if (x > hi) hi = x; }
    }
  }
  return { n, hi };
};
/* --boundary #4E8C7D: kênh lục trội hẳn so với đỏ và lam */
const tealRows = (buf, y0, y1) => {
  let n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (buf[i + 1] > buf[i] + 18 && buf[i + 1] > buf[i + 2] + 8 && buf[i + 1] > 70) n++;
  }
  return n;
};

let failed = 0;
const say = (s) => console.log(s);

for (const shot of plan.shots || []) {
  const f = path.join(vdir, 'shots', shot.id, 'render.mp4');
  const claims = ['frame_silence', 'second_read', 'same_reading_two_worlds'].filter((k) => shot[k]);
  if (!claims.length) continue;
  if (!fs.existsSync(f)) { say(`  ?  ${shot.id}  chưa render`); continue; }
  say(`  ${shot.id}`);
  let bad = null, expect = null;

  if (shot.frame_silence) {
    const fsd = shot.frame_silence;
    expect = fsd.expect || expect;
    const [a, b] = fsd.window;
    const ts = [0, 0.25, 0.5, 0.75, 1].map((k) => +(a + k * (b - a)).toFixed(2));
    const inWin = ts.map((t) => {
      const g = rgb(f, t, shot.id + 'fs' + t);
      return { t, n: barPix(g, fsd.levels.primary).n + barPix(g, fsd.levels.replica).n };
    });
    const after = +(b + 1.4).toFixed(2);
    const gA = rgb(f, Math.min(after, shot.duration - 0.3), shot.id + 'fsA');
    const nAfter = barPix(gA, fsd.levels.primary).n + barPix(gA, fsd.levels.replica).n;
    const silent = inWin.every((r) => r.n === 0);
    say(`     A  R18  trong cửa sổ ${a}–${b}s: ` + inWin.map((r) => `${r.t}s:${r.n}px`).join(' '));
    say(`             sau cửa sổ (${after}s): ${nAfter}px  → ${silent && nAfter > 0 ? 'IM LẶNG ĐÚNG LÚC' : 'PHÁT BIỂU SAI LÚC'}`);
    if (!(silent && nAfter > 0)) bad = 'A';
  }

  if (shot.second_read) {
    const sr = shot.second_read;
    expect = sr.expect || expect;
    const c = rgb(f, sr.at, shot.id + 'sr');
    const up = tealRows(c, 902, 986);
    const down = tealRows(c, 1014, 1190);
    const g = rgb(f, sr.at, shot.id + 'srg');
    const repEnd = barPix(g, 1190).hi;
    const servedBy = down > up ? 'replica' : 'primary';
    const ok = servedBy === 'replica' && repEnd > 0 && repEnd < 700;
    say(`     B  R14  sợi phục vụ: trên ${up}px · dưới ${down}px → ${servedBy}`
      + `   ·  đầu mút tiền tố dưới x=${repEnd}  → ${ok ? 'VẤN ĐỀ CÒN NGUYÊN' : 'HÌNH NÓI ĐÃ SỬA ĐƯỢC'}`);
    if (!ok) bad = 'B';
  }

  if (shot.same_reading_two_worlds) {
    const sw = shot.same_reading_two_worlds;
    expect = sw.expect || expect;
    const gapAt = (t, tag) => {
      const g = rgb(f, t, shot.id + tag);
      return barPix(g, sw.levels.primary).hi - barPix(g, sw.levels.replica).hi;
    };
    const ga = gapAt(sw.world_a, 'wa'), gb = gapAt(sw.world_b, 'wb');
    /* mệnh đề (ii): hai thế giới phải khác nhau ở CHUYỂN ĐỘNG, không ở số đọc */
    const mv = (t) => {
      const a = rgb(f, +(t - 0.5).toFixed(2), shot.id + 'm1' + t);
      const b = rgb(f, +(t + 0.5).toFixed(2), shot.id + 'm2' + t);
      return Math.abs(barPix(b, sw.levels.primary).hi - barPix(a, sw.levels.primary).hi)
           + Math.abs(barPix(b, sw.levels.replica).hi - barPix(a, sw.levels.replica).hi);
    };
    const mvA = mv(sw.world_a), mvB = mv(sw.world_b);
    const sameReading = Math.abs(ga - gb) <= 6;
    const motionDiffers = mvA >= 10 && mvB <= 2;   // px đầu mút dịch trong 1 giây
    const ok = sameReading && motionDiffers;
    say(`     C  R12  khe hở (a) ${ga}px · (b) ${gb}px  |Δ| ${Math.abs(ga - gb)}px`
      + `  → ${sameReading ? 'CÙNG SỐ ĐỌC' : 'SỐ ĐỌC KHÁC NHAU'}`);
    say(`             đầu mút dịch trong 1s: (a) ${mvA}px · (b) ${mvB}px`
      + `  → ${motionDiffers ? 'HAI THẾ GIỚI KHÁC HẲN' : 'không phân biệt được hai thế giới'}`);
    if (!ok) bad = 'C';
  }

  if (expect) {
    if (bad) say(`     ✓ negative control trượt đúng ở ${bad} — phép kiểm có nổ thật`);
    else { say('     ✗ NEGATIVE CONTROL LỌT — phép kiểm hỏng, đừng tin số shot khác'); failed++; }
  } else if (bad) { failed++; say(`     ✗ vi phạm ${bad}`); } else say('     ✓ đạt');
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failed ? `\n${failed} shot có vấn đề\n` : '\nmọi shot đạt\n');
process.exitCode = failed ? 1 : 0;
