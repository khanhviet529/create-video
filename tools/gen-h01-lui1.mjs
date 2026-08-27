/**
 * H01 · STEP 3 · LÙI 1 — bao hàm tiền tố. Kiểm câm.
 *
 * Lịch sử là MỘT đường vị trí. Mỗi node là một ĐOẠN BAO phủ tiền tố nó đã áp.
 * "Sau" thôi là chuyện thứ tự và thành chuyện TRONG / NGOÀI một tiền tố.
 *
 * Vì sao nó không dính L1 ("một phép tịnh tiến là vô hình ở mọi chỗ phẳng"):
 *   R1 buộc hai đường phải sống trên CÙNG trục vị trí, nên chúng trùng nhau ở mọi đoạn phẳng.
 *   Ở đây trục dọc chỉ nói "node nào" và KHÔNG mang đại lượng nào, nên tách hai đoạn bao ra hai
 *   mức là trung thực chứ không phải nói dối. Có một trục tự do — R1 không có.
 *   Đây là KHẲNG ĐỊNH, không phải giả định: `check-prefix-containment.mjs` đo nó.
 *
 * Thứ tự theo đồng hồ không cần trục nào: nó nằm trong THỨ TỰ XUẤT HIỆN. W hiện trước, R hiện
 * sau — và R nằm BÊN TRÁI. Tới muộn hơn, đứng ở vị trí sớm hơn.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './g01-world.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'videos', 'H01-two-meanings-of-after', 'shots');

const G = {
  x0: 170, x1: 910,            // đường lịch sử
  yLine: 1000,                 // vị trí nằm trên đường này
  yPri: 902, yRep: 1190,       // hai mức đoạn bao — trục dọc chỉ nói NODE NÀO
  p0: 496.6, p1: 500.6,        // khoảng vị trí hiển thị
};
const X = (p) => Math.round(G.x0 + (p - G.p0) / (G.p1 - G.p0) * (G.x1 - G.x0));

const CSS = `
#hist { position: absolute; left: ${G.x0}px; top: ${G.yLine - 1}px;
        width: ${G.x1 - G.x0}px; height: 2px; background: var(--rule-bright); }
.pt { position: absolute; width: 2px; height: 20px; margin-left: -1px;
      top: ${G.yLine - 10}px; background: var(--rule-bright); }
.pn { position: absolute; top: ${G.yLine + 34}px; width: 160px; margin-left: -80px;
      text-align: center; font-family: var(--font-value); font-size: 30px; color: var(--ink-dim); }

/* đoạn bao: một thanh + một chốt đầu mút. Cùng màu, cùng sức nặng — không node nào hơn node nào */
.br { position: absolute; height: 4px; background: var(--ink-mid); transform-origin: left center; }
.cap2 { position: absolute; width: 4px; background: var(--ink-mid); }
.brl { position: absolute; font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;
       text-transform: uppercase; font-weight: 500; color: var(--ink-dim); }

/* dấu quan sát: cùng hình, cùng sức nặng — cả hai là câu trả lời ĐÚNG ở chỗ của nó */
.mk { position: absolute; width: 28px; height: 28px; margin: -14px 0 0 -14px; top: ${G.yLine}px;
      background: var(--ground); box-shadow: inset 0 0 0 4px var(--ink); border-radius: 50%; }
.mk.filled { background: var(--ink); }

/* khe hở: phần log mà replica CHƯA áp. Một sự kiện trung tính — không phải một lỗi — nên
   KHÔNG dùng màu báo động, và đặt dưới đường để không chạm dấu nào.
   Bản trước tô --stale và phủ nửa trái dấu ở 500, tức tô báo động lên đúng giá trị đã
   commit ĐÚNG — thứ duy nhất trong khung không có vấn đề gì. */
#gap { position: absolute; top: ${G.yLine + 20}px; height: 3px; background: var(--ink-dim);
       opacity: 0; }
`;

function build({ id, dur, note, js, repEnd = 499, priEnd = 500, sameLevel = false }) {
  const yR = sameLevel ? G.yPri : G.yRep;
  const body = [
    '    <div id="hist"></div>',
    ...[497, 498, 499, 500].flatMap((p) => [
      `    <div class="pt" style="left:${X(p)}px"></div>`,
      `    <div class="pn" style="left:${X(p)}px">${p}</div>`,
    ]),
    `    <div id="gap" style="left:${X(499)}px;width:${X(500) - X(499)}px"></div>`,
    `    <div class="br" id="bPri" style="left:${G.x0}px;top:${G.yPri - 2}px;width:${X(priEnd) - G.x0}px"></div>`,
    `    <div class="cap2" id="cPri" style="left:${X(priEnd)}px;top:${G.yPri - 2}px;height:${G.yLine - G.yPri - 12}px"></div>`,
    `    <div class="br" id="bRep" style="left:${G.x0}px;top:${yR - 2}px;width:${X(repEnd) - G.x0}px"></div>`,
    `    <div class="cap2" id="cRep" style="left:${X(repEnd)}px;top:${G.yLine + 84}px;height:${yR - G.yLine - 82}px"></div>`,
    `    <div class="brl" id="lPri" style="left:${G.x0}px;top:${G.yPri - 46}px">primary đã áp tới</div>`,
    `    <div class="brl" id="lRep" style="left:${G.x0}px;top:${yR + 22}px">replica đã áp tới</div>`,
  ].join('\n');

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
    `const X = (p) => Math.round(${G.x0} + (p - ${G.p0}) / ${G.p1 - G.p0} * ${G.x1 - G.x0});`,
    'function mark(p, filled) {',
    "  const d = document.createElement('div');",
    "  d.className = 'mk' + (filled ? ' filled' : '');",
    "  d.style.left = X(p) + 'px';",
    '  stage.appendChild(d); return d;',
    '}',
    js,
    "window.__timelines['main'] = tl;",
    '<' + '/script>', '</body>', '</html>', ''];

  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), parts.join('\n'));
  console.log('wrote', id, dur + 's');
}

/* ═══════════ ứng viên ═══════════════════════════════════════════════════════ */
build({
  id: 'p-l1-prefix', dur: 26,
  note: '   LÙI 1 — bao hàm tiền tố. Không có trục thời gian; thứ tự theo đồng hồ nằm trong\n'
      + '   THỨ TỰ XUẤT HIỆN. W hiện trước và đứng ở 500; R hiện sau và đứng ở 499, tức BÊN\n'
      + '   TRÁI. Tới muộn hơn, ở vị trí sớm hơn. Vì sao thì đoạn bao nói: câu đọc chỉ thấy\n'
      + '   được thứ nằm trong tiền tố của node phục vụ nó.\n'
      + '   R15 — vị trí 500 KHÔNG BAO GIỜ biến mất và luôn nằm trong đoạn bao của primary.\n'
      + '   "Ngoài tiền tố của replica" là một quan hệ, không phải một sự vắng mặt.',
  js: [
    "gsap.set(['#bPri','#cPri','#bRep','#cRep','#lPri','#lRep'], { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 0 });",
    "gsap.set('#hist', { scaleX: 0, transformOrigin: 'left center' });",
    '',
    '/* 1 · lịch sử: một đường, các vị trí trên nó */',
    "tl.to('#hist', { scaleX: 1, duration: .9, ease: R }, 0.4);",
    "tl.to('.pt', { opacity: 1, duration: .4, stagger: .12 }, 1.2);",
    "tl.to('.pn', { opacity: 1, duration: .4, stagger: .12 }, 1.4);",
    '',
    '/* 2 · MỘT node. Tiền tố phủ tới 500, nên KHÔNG CÓ GÌ nằm ngoài được. */',
    "tl.to(['#bPri','#cPri','#lPri'], { opacity: 1, duration: .6, ease: R }, 3.2);",
    'const solo = mark(500, true);',
    "gsap.set(solo, { opacity: 0 });",
    "tl.to(solo, { opacity: 1, duration: .4, ease: R }, 4.6);",
    "tl.to(solo, { opacity: 0, duration: .4, ease: T }, 7.0);",
    '',
    '/* 3 · node thứ hai. Đoạn bao riêng, ngắn hơn — ở mức riêng của nó. */',
    "tl.to(['#bRep','#cRep','#lRep'], { opacity: 1, duration: .7, ease: R }, 8.0);",
    '',
    '/* 4 · W hiện TRƯỚC, ở 500 */',
    'const W = mark(500, true);',
    "gsap.set(W, { opacity: 0 });",
    "tl.to(W, { opacity: 1, duration: .45, ease: R }, 10.4);",
    '',
    '/* 5 · R hiện SAU, ở 499 — bên TRÁI. Tới muộn hơn, đứng ở vị trí sớm hơn. */',
    'const Rd = mark(499, false);',
    "gsap.set(Rd, { opacity: 0 });",
    "tl.to(Rd, { opacity: 1, duration: .45, ease: R }, 12.8);",
    '',
    '/* 6 · khe hở: phần primary phủ mà replica không. W nằm trong đó. */',
    "tl.to('#gap', { opacity: .85, duration: .6, ease: R }, 15.2);",
    '',
    '/* 7 · replica áp tiếp tới 500 — eventual consistency, thấy được. Chỉ transform. */',
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.1, ease: T }, 19.4);",
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.1, ease: T }, 19.4);",
    "tl.to('#gap', { opacity: 0, duration: .8, ease: T }, 19.9);",
  ].join('\n'),
});

/* ═══════════ negative control 1: hai đoạn bao CÙNG MỨC → đè nhau ═══════════ */
build({
  id: 'p-l1-neg-overlap', dur: 8, sameLevel: true,
  note: '   NEGATIVE CONTROL cho phép kiểm TÁCH ĐƯỢC. Hai đoạn bao vẽ ở CÙNG một mức, nên đoạn\n'
      + '   dài đè lên đoạn ngắn — đúng lỗi đã giết R1, chuyển sang ngữ pháp mới. Shot này TỒN\n'
      + '   TẠI ĐỂ TRƯỢT: nếu bộ kiểm báo đạt thì bộ kiểm hỏng, không phải shot.',
  js: [
    "gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "tl.to([W, Rd], { opacity: 1, duration: .3 }, 0.5);",
  ].join('\n'),
});

/* ═══════════ negative control 2: 500 nằm ngoài MỌI tiền tố ═════════════════ */
build({
  id: 'p-l1-neg-uncovered', dur: 8, priEnd: 499,
  note: '   NEGATIVE CONTROL cho R15. Đoạn bao của primary cũng dừng ở 499, nên vị trí 500 nằm\n'
      + '   NGOÀI mọi tiền tố — tức hình đang nói giá trị đó KHÔNG TỒN TẠI, đúng semantic lock B\n'
      + '   (stale ≠ lost) đi vào qua hình học. Shot này TỒN TẠI ĐỂ TRƯỢT.',
  js: [
    "gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "tl.to([W, Rd], { opacity: 1, duration: .3 }, 0.5);",
  ].join('\n'),
});
