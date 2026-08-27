/**
 * H01 · dựng chương, CÂM. Ba chương rủi ro cao + ba negative control.
 *
 * Nền: thế giới bao hàm của Lùi 1, đã đo sạch ở Q3 · Q4 · Q6 · R15.
 * Cú đảo do LỜI dẫn (beat 17–18 là cặp song song hoàn chỉnh); hình chỉ chở nửa nó chở được.
 *
 * Không polish. Không voice. Không neo timing vào 169s — thời lượng đặt theo nhu cầu kiểm.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './g01-world.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'videos', 'H01-two-meanings-of-after', 'shots');

const G = { x0: 170, x1: 910, yLine: 1000, yPri: 902, yRep: 1190, p0: 496.6, p1: 500.6 };
const X = (p) => Math.round(G.x0 + (p - G.p0) / (G.p1 - G.p0) * (G.x1 - G.x0));

const CSS = `
#hist { position: absolute; left: ${G.x0}px; top: ${G.yLine - 1}px;
        width: ${G.x1 - G.x0}px; height: 2px; background: var(--rule-bright); }
.pt { position: absolute; width: 2px; height: 20px; margin-left: -1px;
      top: ${G.yLine - 10}px; background: var(--rule-bright); }
.pn { position: absolute; top: ${G.yLine + 40}px; width: 150px; margin-left: -168px;
      text-align: right; font-family: var(--font-value); font-size: 30px; color: var(--ink-dim); }
.br { position: absolute; height: 4px; background: var(--ink-mid); transform-origin: left center; }
.cap2 { position: absolute; width: 4px; background: var(--ink-mid); }
.brl { position: absolute; font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;
       text-transform: uppercase; font-weight: 500; color: var(--ink-dim); }
.mk { position: absolute; width: 28px; height: 28px; margin: -14px 0 0 -14px; top: ${G.yLine}px;
      background: var(--ground); box-shadow: inset 0 0 0 4px var(--ink); border-radius: 50%; }
.mk.filled { background: var(--ink); }
.ring { position: absolute; width: 76px; height: 76px; margin: -38px 0 0 -38px; top: ${G.yLine}px;
        border-radius: 50%; box-shadow: inset 0 0 0 3px var(--ink); opacity: 0; }
/* SỢI PHỤC VỤ: câu đọc này được tiền tố NÀO phục vụ. Đi lên = primary, đi xuống = replica. */
.serve { position: absolute; width: 3px; background: var(--boundary); transform-origin: center top; }
.serve.down { transform-origin: center top; }
/* SỢI NEO của remote_apply: đầu mút commit neo vào ĐIỀU KIỆN, không vào thời điểm */
.teth { position: absolute; width: 3px; background: var(--authoritative); transform-origin: center top; }
/* MỐC trên MỘT hành trình — không phải ba thanh ngang nhau */
.ms { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%;
      background: var(--ink-dim); }
.msl { position: absolute; font-family: var(--font-value); font-size: 26px; color: var(--ink-dim);
       margin-left: 26px; margin-top: -16px; }
#gapb { position: absolute; top: ${G.yLine + 20}px; height: 3px; background: var(--ink-dim); opacity: 0; }
`;

const BASE_BODY = (opts = {}) => [
  '    <div id="hist"></div>',
  ...[497, 498, 499, 500].flatMap((p) => [
    `    <div class="pt" style="left:${X(p)}px"></div>`,
    `    <div class="pn" style="left:${X(p)}px">${p}</div>`,
  ]),
  `    <div id="gapb" style="left:${X(499)}px;width:${X(500) - X(499)}px"></div>`,
  `    <div class="br" id="bPri" style="left:${G.x0}px;top:${G.yPri - 2}px;width:${X(500) - G.x0}px"></div>`,
  `    <div class="cap2" id="cPri" style="left:${X(500)}px;top:${G.yPri - 2}px;height:${G.yLine - G.yPri - 12}px"></div>`,
  `    <div class="br" id="bRep" style="left:${G.x0}px;top:${G.yRep - 2}px;width:${X(opts.repEnd ?? 499) - G.x0}px"></div>`,
  `    <div class="cap2" id="cRep" style="left:${X(opts.repEnd ?? 499)}px;top:${G.yLine + 84}px;height:${G.yRep - G.yLine - 82}px"></div>`,
  `    <div class="brl" id="lPri" style="left:${G.x0}px;top:${G.yPri - 46}px">primary đã áp tới</div>`,
  `    <div class="brl" id="lRep" style="left:${G.x0}px;top:${G.yRep + 22}px">replica đã áp tới</div>`,
].join('\n');

const HELPERS = [
  `const X = (p) => Math.round(${G.x0} + (p - ${G.p0}) / ${G.p1 - G.p0} * ${G.x1 - G.x0});`,
  'function mark(p, filled) {',
  "  const d = document.createElement('div');",
  "  d.className = 'mk' + (filled ? ' filled' : '');",
  "  d.style.left = X(p) + 'px'; stage.appendChild(d); return d;",
  '}',
  '/* sợi phục vụ: nối một câu đọc với tiền tố ĐANG phục vụ nó */',
  'function serve(p, dir) {',
  "  const d = document.createElement('div');",
  "  d.className = 'serve';",
  `  const up = dir === 'up';`,
  `  const top = up ? ${G.yPri} : ${G.yLine + 14};`,
  `  const h = up ? ${G.yLine - 14 - G.yPri} : ${G.yRep - G.yLine - 14};`,
  "  d.style.cssText = 'left:' + (X(p) - 1) + 'px;top:' + top + 'px;height:' + h + 'px';",
  '  stage.appendChild(d); return d;',
  '}',
].join('\n');

function build({ id, dur, note, body, js }) {
  const parts = ['<!doctype html>', '<html lang="vi">', '<head>',
    '<meta charset="UTF-8" />', '<meta name="viewport" content="width=1080, height=1920" />',
    '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><' + '/script>',
    '<style>', BRAND, CSS, '',
    '/* ---------------------------------------------------------------------------',
    note, '--------------------------------------------------------------------------- */',
    '</style>', '</head>', '<body>',
    `<div id="root" data-composition-id="main" data-start="0" data-duration="${dur}"`,
    '     data-width="1080" data-height="1920">',
    `  <div id="stage" class="clip" data-start="0" data-duration="${dur}" data-track-index="0">`,
    body, '  </div>', '</div>', '',
    '<script>',
    'window.__timelines = window.__timelines || {};',
    'const tl = gsap.timeline({ paused: true });',
    "const R = 'power3.out', T = 'power2.inOut';",
    "const stage = document.getElementById('stage');",
    HELPERS, js,
    "window.__timelines['main'] = tl;",
    '<' + '/script>', '</body>', '</html>', ''];
  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), parts.join('\n'));
  console.log('wrote', id, dur + 's');
}

/* ══════════════════ CH-B · AHA (beat 16–19) ═══════════════════════════════════
   R18: hình KHÔNG được phát biểu theo hệ VỊ TRÍ trong lúc lời đang nói theo hệ ĐỒNG HỒ.
   Cách xử: hệ quy chiếu của hình ĐẾN CÙNG mệnh đề gọi tên nó. Trong cửa sổ beat 17 không
   có đoạn bao nào trên màn hình — hình im lặng về hệ quy chiếu. Beat 18 gọi tên vị trí log,
   và đúng lúc đó đoạn bao mới tới. */
build({
  id: 'ch-aha', dur: 15,
  note: '   CH-B · AHA. Hai dấu có mặt từ đầu, W trước R. Trong beat 17 (hệ ĐỒNG HỒ) KHÔNG có\n'
      + '   đoạn bao nào — hình không phát biểu hệ nào cả. Beat 18 gọi tên hệ VỊ TRÍ và đoạn bao\n'
      + '   tới đúng lúc đó. Beat 19: bỏ node thứ hai đi thì tiền tố duy nhất chứa cả hai dấu,\n'
      + '   nên chuyện loại trừ KHÔNG PHÁT BIỂU ĐƯỢC — "với một node, hai cách đo là một".',
  body: BASE_BODY(),
  js: [
    "gsap.set(['#bPri','#cPri','#bRep','#cRep','#lPri','#lRep','#gapb'], { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 0 });",
    "gsap.set('#hist', { scaleX: 0, transformOrigin: 'left center' });",
    '',
    '/* beat 16 — chỉ có lịch sử và hai sự kiện. Không hệ quy chiếu nào được phát biểu. */',
    "tl.to('#hist', { scaleX: 1, duration: .7, ease: R }, 0.3);",
    "tl.to('.pt', { opacity: 1, duration: .3, stagger: .08 }, 0.9);",
    "tl.to('.pn', { opacity: 1, duration: .3, stagger: .08 }, 1.0);",
    'const W = mark(500, true), Rd = mark(499, false);',
    'gsap.set([W, Rd], { opacity: 0 });',
    "tl.to(W, { opacity: 1, duration: .4, ease: R }, 1.6);",
    "tl.to(Rd, { opacity: 1, duration: .4, ease: R }, 2.4);",
    '',
    '/* beat 17 (2.9 → 5.6) — hệ ĐỒNG HỒ. Hình IM LẶNG: không đoạn bao nào xuất hiện. */',
    '',
    '/* beat 18 (5.6) — hệ VỊ TRÍ được gọi tên, và đoạn bao tới đúng lúc đó */',
    "tl.to(['#bPri','#cPri','#lPri'], { opacity: 1, duration: .5, ease: R }, 5.8);",
    "tl.to(['#bRep','#cRep','#lRep'], { opacity: 1, duration: .5, ease: R }, 6.6);",
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 7.6);",
    '',
    '/* beat 19 — MỘT node: tiền tố thứ hai biến mất, và cùng với nó là chính khả năng',
    '   phát biểu chuyện loại trừ. Rồi node thứ hai trở lại, và nó phát biểu lại được. */',
    "tl.to(['#bRep','#cRep','#lRep','#gapb'], { opacity: 0, duration: .5, ease: T }, 9.6);",
    "tl.to(['#bRep','#cRep','#lRep'], { opacity: 1, duration: .5, ease: R }, 12.4);",
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 13.0);",
  ].join('\n'),
});

/* negative control cho R18: đoạn bao có mặt SUỐT, kể cả trong cửa sổ beat 17 */
build({
  id: 'ch-aha-neg-frame', dur: 6,
  note: '   NEGATIVE CONTROL cho R18. Đoạn bao có mặt ngay từ đầu, tức hình đang phát biểu hệ\n'
      + '   VỊ TRÍ trong lúc lời nói theo hệ ĐỒNG HỒ. Shot này TỒN TẠI ĐỂ TRƯỢT.',
  body: BASE_BODY(),
  js: ["gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "tl.to([W, Rd], { opacity: 1, duration: .3 }, 0.4);"].join('\n'),
});

/* ══════════════════ CH-A · BỐN VỊ TRÍ (beat 25–33) ════════════════════════════
   Bốn phép biến hình KHÁC LOẠI trên cùng một trường: nối lại · chờ · neo · không vẽ.
   Tỉ lệ GIỮ NGUYÊN suốt đoạn — §9 (ngang hàng) thắng §7 (leo thang), đã duyệt. */
build({
  id: 'ch-bon-vi-tri', dur: 30,
  note: '   CH-A · bốn vị trí. Bốn phép KHÁC LOẠI: V1 nối lại sợi phục vụ · V2 chờ · V3 neo\n'
      + '   đầu mút commit vào ĐIỀU KIỆN · V4 không vẽ gì. Ngang hàng là hệ quả của hình học\n'
      + '   khác nhau, không phải của ô bằng nhau. Tỉ lệ không đổi một lần nào.\n'
      + '   R11 — nửa AVAILABILITY của remote_apply CỐ Ý KHÔNG DỰNG: package chỉ nói "replica\n'
      + '   chết thì đường ghi ĐỨNG theo" và không có chữ nào về timeout. Giữ đánh dấu chưa đủ.\n'
      + '   R14 — beat 33 đưa vào CÂU ĐỌC THỨ HAI, và nó nối XUỐNG tiền tố vẫn dừng ở 499.',
  body: BASE_BODY(),
  js: [
    "gsap.set('#gapb', { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true);',
    'const R1 = mark(499, false);',
    "gsap.set([W, R1], { opacity: 0 });",
    "tl.to([W, R1], { opacity: 1, duration: .4, ease: R }, 0.6);",
    '/* mặc định: câu đọc được tiền tố DƯỚI phục vụ */',
    "const s0 = serve(499, 'down'); gsap.set(s0, { opacity: 0, scaleY: 0 });",
    "tl.to(s0, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 1.4);",
    '',
    '/* V1 (beat 26–27) — NỐI LẠI: chính câu đọc đó được tiền tố TRÊN phục vụ. 500 nằm trong. */',
    "const s1 = serve(500, 'up'); gsap.set(s1, { opacity: 0, scaleY: 0 });",
    "tl.to(s0, { opacity: 0, duration: .35, ease: T }, 3.6);",
    "tl.to(s1, { opacity: 1, scaleY: 1, duration: .6, ease: R }, 3.9);",
    '/* beat 27 — cái giá: chỉ ĐÚNG câu đọc này được nối lại. Câu đọc khác vẫn nối xuống. */',
    'const R1b = mark(498, false); gsap.set(R1b, { opacity: 0 });',
    "const s1b = serve(498, 'down'); gsap.set(s1b, { opacity: 0, scaleY: 0 });",
    "tl.to([R1b], { opacity: 1, duration: .4, ease: R }, 6.0);",
    "tl.to(s1b, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 6.3);",
    "tl.to([s1, s1b, R1b], { opacity: 0, duration: .5, ease: T }, 8.4);",
    '',
    '/* V2 (beat 28–29) — CHỜ: tiền tố dưới đi tới 500 TRƯỚC, câu đọc mới xảy ra. */',
    "tl.to(R1, { opacity: 0, duration: .3, ease: T }, 9.0);",
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.0, ease: T }, 9.6);",
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.0, ease: T }, 9.6);",
    'const R2 = mark(500, false); gsap.set(R2, { opacity: 0 });',
    "const s2 = serve(500, 'down'); gsap.set(s2, { opacity: 0, scaleY: 0 });",
    "tl.to(R2, { opacity: 1, duration: .4, ease: R }, 11.0);",
    "tl.to(s2, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 11.3);",
    '/* trả trường về trạng thái gốc cho vị trí kế */',
    "tl.to([R2, s2], { opacity: 0, duration: .4, ease: T }, 13.4);",
    "tl.to('#bRep', { scaleX: 1, duration: .01 }, 14.0);",
    "tl.to('#cRep', { x: 0, duration: .01 }, 14.0);",
    '',
    '/* V3 (beat 30–31) — NEO: đầu mút của chính DẤU COMMIT neo vào ĐIỀU KIỆN "tiền tố dưới',
    '   chạm 500", không neo vào một thời điểm. Sợi neo giữ, tiền tố đi tới, rồi mới nhả. */',
    'const th = document.createElement("div"); th.className = "teth";',
    'th.style.cssText = "left:" + (X(500) - 1) + "px;top:" + ' + (G.yLine + 14)
      + ' + "px;height:" + ' + (G.yRep - G.yLine - 14) + ' + "px";',
    'stage.appendChild(th); gsap.set(th, { opacity: 0, scaleY: 0 });',
    'const rW = document.createElement("div"); rW.className = "ring";',
    'rW.style.left = X(500) + "px"; stage.appendChild(rW);',
    "tl.to(th, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 15.0);",
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.6, ease: T }, 16.2);",
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.6, ease: T }, 16.2);",
    'tl.fromTo(rW, { opacity: 0, scale: .55 }, { opacity: 1, scale: 1, duration: .35, ease: R }, 18.0);',
    "tl.to(rW, { opacity: 0, scale: 1.35, duration: .5, ease: T }, 18.4);",
    "tl.to(th, { opacity: 0, duration: .4, ease: T }, 18.6);",
    "tl.to('#bRep', { scaleX: 1, duration: .01 }, 19.6);",
    "tl.to('#cRep', { x: 0, duration: .01 }, 19.6);",
    '',
    '/* V4 (beat 32–33) — KHÔNG VẼ: không câu đọc nào chạm tiền tố dưới, nên trường KHÔNG ĐỔI.',
    '   Rồi beat 33 đưa vào CÂU ĐỌC THỨ HAI — và nó nối xuống một tiền tố vẫn dừng ở 499. */',
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 21.0);",
    'const R4 = mark(499, false); gsap.set(R4, { opacity: 0 });',
    "const s4 = serve(499, 'down'); gsap.set(s4, { opacity: 0, scaleY: 0 });",
    "tl.to(R4, { opacity: 1, duration: .45, ease: R }, 25.4);",
    "tl.to(s4, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 25.8);",
  ].join('\n'),
});

/* negative control cho R14: câu đọc thứ hai nối LÊN — tức hình nói V4 đã sửa được hệ thống */
build({
  id: 'ch-bvt-neg-secondread', dur: 6,
  note: '   NEGATIVE CONTROL cho R14. Câu đọc thứ hai nối LÊN tiền tố primary, tức hình đang nói\n'
      + '   rằng "hiện luôn giá trị vừa gửi" đã sửa được ngữ nghĩa replication. Shot TỒN TẠI ĐỂ TRƯỢT.',
  body: BASE_BODY(),
  js: ["gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), R4 = mark(499, false);',
    "const s4 = serve(499, 'up');",
    "tl.to([W, R4, s4], { opacity: 1, duration: .3 }, 0.4);"].join('\n'),
});

/* ══════════════════ CH-C · DETECTION (beat 34–38) ═════════════════════════════
   R6 — ba MỐC trên MỘT hành trình, không phải ba thanh ngang nhau. Chỉ mốc cuối nối được
        vào đầu mút tiền tố, vì chỉ "applied" mới dời được cái đầu mút đó.
   R12 — cùng một số đọc cho HAI thế giới khác nhau: gap nhỏ vì vừa chép kịp, và gap bằng
        không vì KHÔNG CÓ GÌ ĐỂ CHÉP. */
build({
  id: 'ch-do-luong', dur: 22,
  note: '   CH-C · phát hiện. Ba loại lag là BA MỐC trên một hành trình WAL đi từ primary xuống\n'
      + '   replica — không phải ba thanh ngang nhau. Chỉ mốc thứ ba (applied) có sợi nối tới\n'
      + '   ĐẦU MÚT tiền tố, vì chỉ nó dời được đầu mút đó; hai mốc kia nói về độ bền.\n'
      + '   R12 — hai thế giới cho CÙNG một số đọc: (a) hai đầu mút cùng tiến, khe hở nhỏ;\n'
      + '   (b) không đầu mút nào tiến, khe hở bằng không vì KHÔNG CÓ GÌ ĐỂ CHÉP.',
  body: BASE_BODY() + '\n'
    + [16, 17, 18].map((_, k) => `    <div class="ms" id="m${k}" style="left:${X(500)}px;top:${G.yLine + 30 + k * 52}px"></div>\n`
      + `    <div class="msl" id="ml${k}" style="left:${X(500)}px;top:${G.yLine + 30 + k * 52}px">`
      + ['write_lag', 'flush_lag', 'replay_lag'][k] + '</div>').join('\n'),
  js: [
    "gsap.set('.pt, .pn', { opacity: 1 });",
    "gsap.set(['#m0','#m1','#m2','#ml0','#ml1','#ml2','#gapb'], { opacity: 0 });",
    'const W = mark(500, true); gsap.set(W, { opacity: 0 });',
    "tl.to(W, { opacity: 1, duration: .4, ease: R }, 0.5);",
    '',
    '/* beat 35 — ba mốc, LẦN LƯỢT, trên MỘT hành trình đi xuống. Không song song, không cùng cỡ. */',
    "tl.to(['#m0','#ml0'], { opacity: 1, duration: .35, ease: R }, 2.0);",
    "tl.to(['#m1','#ml1'], { opacity: 1, duration: .35, ease: R }, 3.0);",
    "tl.to(['#m2','#ml2'], { opacity: 1, duration: .35, ease: R }, 4.0);",
    '',
    '/* beat 36 — chỉ mốc CUỐI có sợi nối tới đầu mút tiền tố. Hai mốc kia không nối vào đâu. */',
    'const ln = document.createElement("div"); ln.className = "teth";',
    'ln.style.cssText = "left:" + (X(500) - 1) + "px;top:" + ' + (G.yLine + 134)
      + ' + "px;height:" + ' + (G.yRep - G.yLine - 134) + ' + "px";',
    'stage.appendChild(ln); gsap.set(ln, { opacity: 0, scaleY: 0 });',
    "tl.to(ln, { opacity: 1, scaleY: 1, duration: .6, ease: R }, 5.6);",
    "tl.to(['#m0','#ml0','#m1','#ml1'], { opacity: .28, duration: .5, ease: T }, 6.4);",
    '',
    '/* beat 37 — khe hở nhỏ vẫn là khe hở: một câu đọc rơi vào đó vẫn thấy giá trị cũ */',
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 8.4);",
    'const Rd = mark(499, false); gsap.set(Rd, { opacity: 0 });',
    "const sd = serve(499, 'down'); gsap.set(sd, { opacity: 0, scaleY: 0 });",
    "tl.to(Rd, { opacity: 1, duration: .4, ease: R }, 9.2);",
    "tl.to(sd, { opacity: 1, scaleY: 1, duration: .45, ease: R }, 9.5);",
    '',
    '/* THẾ GIỚI (a) — hai đầu mút CÙNG TIẾN, khe hở giữ nguyên bề rộng */',
    "tl.to([Rd, sd], { opacity: 0, duration: .35, ease: T }, 11.6);",
    "tl.to('#bPri', { scaleX: " + ((X(500) + 60 - G.x0) / (X(500) - G.x0)).toFixed(4)
      + ", duration: 1.4, ease: 'none' }, 12.4);",
    "tl.to('#cPri', { x: 60, duration: 1.4, ease: 'none' }, 12.4);",
    "tl.to('#bRep', { scaleX: " + ((X(499) + 60 - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.4, ease: 'none' }, 12.4);",
    "tl.to('#cRep', { x: 60, duration: 1.4, ease: 'none' }, 12.4);",
    "tl.to('#gapb', { x: 60, duration: 1.4, ease: 'none' }, 12.4);",
    '',
    '/* THẾ GIỚI (b) — beat 38: primary RẢNH. KHÔNG đầu mút nào tiến nữa, và khe hở giữ',
    '   NGUYÊN bề rộng. Số đọc y hệt thế giới (a) — thứ khác là CHUYỂN ĐỘNG, không phải số.',
    '   Đó chính là signal ≠ diagnosis: cùng một con số nhỏ, hai tình huống khác hẳn. */',
    '/* (không tween nào ở đây — sự đứng yên CHÍNH LÀ thế giới (b)) */',
  ].join('\n'),
});

/* negative control cho R12: khe hở KHÁC bề rộng ở hai thế giới → không còn "cùng số đọc" */
build({
  id: 'ch-dl-neg-reading', dur: 9,
  note: '   NEGATIVE CONTROL cho R12. Khe hở ở hai thế giới có bề rộng KHÁC nhau, nên chúng\n'
      + '   không còn cho cùng một số đọc — mất hẳn bài học signal ≠ diagnosis. TỒN TẠI ĐỂ TRƯỢT.',
  body: BASE_BODY({ repEnd: 498 }),
  js: ["gsap.set('.pt, .pn', { opacity: 1 });",
    "gsap.set('#gapb', { opacity: .85 });",
    'const W = mark(500, true);',
    "tl.to(W, { opacity: 1, duration: .3 }, 0.4);",
    '/* khe hở ĐỔI bề rộng giữa hai mốc, VÀ có chuyển động ở mốc (a) — nên nếu bộ kiểm vẫn',
    '   báo "cùng số đọc" thì chính bộ kiểm hỏng, không phải shot. */',
    "tl.to('#bRep', { scaleX: " + ((X(499) - G.x0) / (X(498) - G.x0)).toFixed(4)
      + ", duration: 1.6, ease: 'none' }, 2.0);",
    "tl.to('#cRep', { x: " + (X(499) - X(498)) + ", duration: 1.6, ease: 'none' }, 2.0);"].join('\n'),
});
