/**
 * H01 · STEP 3 · R1 — kiểm câm phép chiếu.
 *
 * Câu hỏi duy nhất: cùng HAI sự kiện đó có giữ được y nguyên về hình học trong khi đổi hệ quy
 * chiếu, sao cho người xem hiểu được sự đảo thứ tự?
 *
 * Câm. Không voice, không polish, không chương. Hai shot:
 *   p-r1-projection    ứng viên
 *   p-r1-neg-slope     NEGATIVE CONTROL — replica cố ý dốc thấp hơn, để xác nhận bộ kiểm R8
 *                      thật sự bắt được vi phạm. Một chặn chưa từng nổ thì chưa phải chặn.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeProto } from './h01-field.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const proto = makeProto(path.join(ROOT, 'videos', 'H01-two-meanings-of-after', 'shots'));

/* Lịch sử: primary đứng ở 499, rồi commit đưa nó lên 500 và đứng đó.
   Con số là VỊ TRÍ ví dụ cho khoảng cách một nhịp — không phải phép đo, không phải tốc độ. */
const PRIMARY = [[0.4, 499], [4.6, 499], [5.0, 500], [9.6, 500]];
const LAG = 2.4;                 // replica tới cùng vị trí đó muộn hơn — MỘT phép tịnh tiến
const T_W = 5.0, P_W = 500;      // commit
const T_R = 6.6, P_R = 499;      // câu đọc: MUỘN hơn theo đồng hồ, THẤP hơn theo vị trí

const common = (negSlope) => [
  'const PRI = ' + JSON.stringify(PRIMARY) + ';',
  negSlope
    ? '/* NEGATIVE CONTROL: cố ý KHÔNG tịnh tiến — replica được kéo giãn theo thời gian nên'
    : '/* R8: replica LÀ đường primary, dịch sang phải. Song song theo cấu tạo. */',
  negSlope
    ? '   độ dốc của nó thấp hơn. Hình lúc đó nói "replica chạy chậm hơn" — sai package. */'
    : 'const REP = shift(PRI, ' + LAG + ');',
  negSlope
    ? 'const REP = PRI.map(([t, p], i) => [PRI[0][0] + (t - PRI[0][0]) * 2.1 + 0.4, p]);'
    : '',
  "const pl = polyline(PRI, 'pline');",
  "const rl = polyline(REP, 'rline');",
  '',
  '/* hai dấu — cùng hình, cùng sức nặng. Cả hai đều là câu trả lời ĐÚNG ở vị trí của nó. */',
  'const W = mark(' + T_W + ', ' + P_W + ', true);',
  'const Rm = mark(' + T_R + ', ' + P_R + ', false);',
  '',
  "gsap.set([pl, rl, W, Rm], { opacity: 0 });",
].filter(Boolean);

/* ═══════════════ p-r1-projection ═══════════════════════════════════════════════ */
proto({
  id: 'p-r1-projection', dur: 26,
  note: '   R1 — phép chiếu. Hai dấu KHÔNG di chuyển một pixel nào trong suốt shot. Thứ đổi là\n'
      + '   trục nào đang chiếu. Với một node, hai phép chiếu cho cùng thứ tự; với hai node,\n'
      + '   chúng buộc phải bất đồng, và sự bất đồng đó là hệ quả hình học của việc một dấu rời\n'
      + '   khỏi đường primary — không phải một hiệu ứng được thêm vào.',
  css: '#lx { left: 150px; top: 1400px; } #ly { left: 150px; top: 560px; }\n'
     + '#lx { color: var(--authoritative); } #ly { color: var(--boundary); }',
  body: '    <div id="lx" class="axlbl">đồng hồ</div>\n'
      + '    <div id="ly" class="axlbl">vị trí trên lịch sử</div>',
  js: [
    ...common(false),
    "gsap.set(['#lx','#ly'], { opacity: 0 });",
    '',
    '/* ── 1 · MỘT node. Hai quan sát, cả hai trên đường primary ─────────────────── */',
    'const a1 = mark(2.2, 499, true), b1 = mark(7.4, 500, true);',
    'gsap.set([a1, b1], { opacity: 0 });',
    "tl.to(pl, { opacity: 1, duration: .6, ease: R }, 0.3);",
    "tl.to('#lx', { opacity: 1, duration: .4 }, 0.5);",
    "tl.to([a1, b1], { opacity: 1, duration: .4, ease: R }, 1.2);",
    '',
    '/* chiếu xuống đồng hồ: A rồi B */',
    'const ca = projectClock(2.2, 499), cb = projectClock(7.4, 500);',
    'gsap.set([ca.g, cb.g], { opacity: 0 });',
    'gsap.set([ca.line, cb.line], { scaleY: 0, transformOrigin: "center top" });',
    "tl.to([ca.g, cb.g], { opacity: 1, duration: .2 }, 2.0);",
    "tl.to(ca.line, { scaleY: 1, duration: .5, ease: T }, 2.0);",
    "tl.to(cb.line, { scaleY: 1, duration: .5, ease: T }, 2.5);",
    '',
    '/* chiếu sang vị trí: A rồi B — CÙNG thứ tự. Đây là "một node thì hai cách đo là một". */',
    'const pa = projectPos(2.2, 499), pb = projectPos(7.4, 500);',
    'gsap.set([pa.g, pb.g], { opacity: 0 });',
    'gsap.set([pa.line, pb.line], { scaleX: 0, transformOrigin: "right center" });',
    "tl.to('#ly', { opacity: 1, duration: .4 }, 3.2);",
    "tl.to([pa.g, pb.g], { opacity: 1, duration: .2 }, 3.4);",
    "tl.to(pa.line, { scaleX: 1, duration: .5, ease: T }, 3.4);",
    "tl.to(pb.line, { scaleX: 1, duration: .5, ease: T }, 3.9);",
    '',
    '/* ── 2 · node thứ hai: CÙNG đường đó, dịch đi ──────────────────────────────── */',
    "tl.to([ca.g, cb.g, pa.g, pb.g, a1, b1], { opacity: 0, duration: .5, ease: T }, 6.6);",
    "tl.to(rl, { opacity: 1, duration: .7, ease: R }, 7.4);",
    '',
    '/* ── 3 · hai sự kiện được đặt vào chỗ của chúng, rồi KHÔNG BAO GIỜ động nữa ── */',
    "tl.to(W, { opacity: 1, duration: .4, ease: R }, 9.0);",
    "tl.to(Rm, { opacity: 1, duration: .4, ease: R }, 10.2);",
    '',
    '/* ── 4 · hệ quy chiếu ĐỒNG HỒ: W trước, R sau ─────────────────────────────── */',
    'const cw = projectClock(' + T_W + ', ' + P_W + '), cr = projectClock(' + T_R + ', ' + P_R + ');',
    'gsap.set([cw.g, cr.g], { opacity: 0 });',
    'gsap.set([cw.line, cr.line], { scaleY: 0, transformOrigin: "center top" });',
    "tl.to([cw.g, cr.g], { opacity: 1, duration: .2 }, 11.6);",
    "tl.to(cw.line, { scaleY: 1, duration: .55, ease: T }, 11.6);",
    "tl.to(cr.line, { scaleY: 1, duration: .55, ease: T }, 12.4);",
    '',
    '/* ── 5 · hệ quy chiếu VỊ TRÍ: R trước, W sau. Hai dấu vẫn ở nguyên chỗ cũ ─── */',
    "tl.to([cw.g, cr.g], { opacity: .18, duration: .5, ease: T }, 15.4);",
    'const pw = projectPos(' + T_W + ', ' + P_W + '), pr = projectPos(' + T_R + ', ' + P_R + ');',
    'gsap.set([pw.g, pr.g], { opacity: 0 });',
    'gsap.set([pw.line, pr.line], { scaleX: 0, transformOrigin: "right center" });',
    "tl.to([pw.g, pr.g], { opacity: 1, duration: .2 }, 16.0);",
    "tl.to(pr.line, { scaleX: 1, duration: .55, ease: T }, 16.0);",
    "tl.to(pw.line, { scaleX: 1, duration: .55, ease: T }, 16.8);",
    '',
    '/* ── 6 · cả hai hệ cùng bật. Mâu thuẫn đứng yên trên màn hình ─────────────── */',
    "tl.to([cw.g, cr.g], { opacity: 1, duration: .6, ease: R }, 19.6);",
  ].join('\n'),
});

/* ═══════════════ p-r1-neg-slope — NEGATIVE CONTROL ════════════════════════════ */
proto({
  id: 'p-r1-neg-slope', dur: 8,
  note: '   NEGATIVE CONTROL cho R8. Đường replica ở đây được kéo GIÃN theo thời gian thay vì\n'
      + '   được tịnh tiến, nên độ dốc của nó thấp hơn — tức hình đang nói "replica chạy chậm\n'
      + '   hơn", đúng thứ semantic lock A cấm. Shot này TỒN TẠI ĐỂ TRƯỢT. Nếu bộ kiểm độ dốc\n'
      + '   báo shot này đạt thì bộ kiểm hỏng, không phải shot.',
  js: [
    ...common(true),
    "tl.to([pl, rl], { opacity: 1, duration: .6, ease: R }, 0.3);",
    "tl.to([W, Rm], { opacity: 1, duration: .4, ease: R }, 1.4);",
  ].join('\n'),
});
