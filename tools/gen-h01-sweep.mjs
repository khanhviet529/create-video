/**
 * H01 · STEP 3 · prototype CUỐI — cú đổi cách nhìn TRONG thế giới bao hàm.
 *
 * Nền là Lùi 1, đã kiểm sạch ở Q3 · Q4 · Q6 · R15. Lượt này chỉ THÊM MỘT SỰ KIỆN:
 * hai sự kiện được duyệt một lần theo thứ tự TỚI, một lần theo thứ tự VỊ TRÍ.
 *
 * R16 — không vật nào DI CHUYỂN. Mỗi lượt chỉ là hai vòng sáng nổ lần lượt trên hai dấu đứng
 * yên, nên không có vận tốc nào để so. Thứ duy nhất còn mang nhịp là KHOẢNG giữa hai lần nổ,
 * và nó BẰNG NHAU ở cả hai lượt theo cấu tạo: cùng một hằng số GAP.
 *
 * R17 — đã khai trước ở STEP3_SWEEP_PREDECLARATION.md: hướng của mỗi lượt là tất yếu (R nằm
 * trái W), nhưng bản thân cú duyệt thì không; và đây là ĐỔI TIÊU ĐIỂM, không phải L3.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './g01-world.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'videos', 'H01-two-meanings-of-after', 'shots');

const G = { x0: 170, x1: 910, yLine: 1000, yPri: 902, yRep: 1190, p0: 496.6, p1: 500.6 };
const X = (p) => Math.round(G.x0 + (p - G.p0) / (G.p1 - G.p0) * (G.x1 - G.x0));

/* Hai lượt duyệt, cùng một hằng số khoảng cách — R16 đúng theo CẤU TẠO, không theo chỉnh tay */
const GAP = 2.0;
const A0 = 12.0;              // lượt TỚI:    W trước, rồi R  (phải → trái)
const B0 = 18.0;              // lượt VỊ TRÍ: R trước, rồi W  (trái → phải)

const CSS = `
#hist { position: absolute; left: ${G.x0}px; top: ${G.yLine - 1}px;
        width: ${G.x1 - G.x0}px; height: 2px; background: var(--rule-bright); }
.pt { position: absolute; width: 2px; height: 20px; margin-left: -1px;
      top: ${G.yLine - 10}px; background: var(--rule-bright); }
.pn { position: absolute; top: ${G.yLine + 40}px; width: 160px; margin-left: -80px;
      text-align: center; font-family: var(--font-value); font-size: 30px; color: var(--ink-dim); }
#gap { position: absolute; top: ${G.yLine + 20}px; height: 3px; background: var(--ink-dim); opacity: 0; }
.br { position: absolute; height: 4px; background: var(--ink-mid); transform-origin: left center; }
.cap2 { position: absolute; width: 4px; background: var(--ink-mid); }
.brl { position: absolute; font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;
       text-transform: uppercase; font-weight: 500; color: var(--ink-dim); }
.mk { position: absolute; width: 28px; height: 28px; margin: -14px 0 0 -14px; top: ${G.yLine}px;
      background: var(--ground); box-shadow: inset 0 0 0 4px var(--ink); border-radius: 50%; }
.mk.filled { background: var(--ink); }
/* vòng sáng: chỉ transform + opacity, và nó KHÔNG che dấu — nó nở ra ngoài dấu */
.ring { position: absolute; width: 76px; height: 76px; margin: -38px 0 0 -38px; top: ${G.yLine}px;
        border-radius: 50%; box-shadow: inset 0 0 0 3px var(--ink); opacity: 0; }
`;

function build({ id, dur, note, gapB = GAP }) {
  const body = [
    '    <div id="hist"></div>',
    ...[497, 498, 499, 500].flatMap((p) => [
      `    <div class="pt" style="left:${X(p)}px"></div>`,
      `    <div class="pn" style="left:${X(p)}px">${p}</div>`,
    ]),
    `    <div id="gap" style="left:${X(499)}px;width:${X(500) - X(499)}px"></div>`,
    `    <div class="br" id="bPri" style="left:${G.x0}px;top:${G.yPri - 2}px;width:${X(500) - G.x0}px"></div>`,
    `    <div class="cap2" id="cPri" style="left:${X(500)}px;top:${G.yPri - 2}px;height:${G.yLine - G.yPri - 12}px"></div>`,
    `    <div class="br" id="bRep" style="left:${G.x0}px;top:${G.yRep - 2}px;width:${X(499) - G.x0}px"></div>`,
    `    <div class="cap2" id="cRep" style="left:${X(499)}px;top:${G.yLine + 84}px;height:${G.yRep - G.yLine - 82}px"></div>`,
    `    <div class="brl" id="lPri" style="left:${G.x0}px;top:${G.yPri - 46}px">primary đã áp tới</div>`,
    `    <div class="brl" id="lRep" style="left:${G.x0}px;top:${G.yRep + 22}px">replica đã áp tới</div>`,
    `    <div class="ring" id="rW" style="left:${X(500)}px"></div>`,
    `    <div class="ring" id="rR" style="left:${X(499)}px"></div>`,
  ].join('\n');

  const ring = (sel, t) => `tl.fromTo('${sel}', { opacity: 0, scale: .55 }, `
    + `{ opacity: 1, scale: 1, duration: .34, ease: R }, ${t});\n`
    + `tl.to('${sel}', { opacity: 0, scale: 1.35, duration: .5, ease: T }, ${+(t + 0.4).toFixed(2)});`;

  const js = [
    "gsap.set(['#bPri','#cPri','#bRep','#cRep','#lPri','#lRep'], { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 0 });",
    "gsap.set('#hist', { scaleX: 0, transformOrigin: 'left center' });",
    '',
    '/* 1 · lịch sử */',
    "tl.to('#hist', { scaleX: 1, duration: .9, ease: R }, 0.4);",
    "tl.to('.pt', { opacity: 1, duration: .4, stagger: .12 }, 1.2);",
    "tl.to('.pn', { opacity: 1, duration: .4, stagger: .12 }, 1.4);",
    '',
    '/* 2 · MỘT node — tiền tố phủ tới 500, không gì nằm ngoài được */',
    "tl.to(['#bPri','#cPri','#lPri'], { opacity: 1, duration: .6, ease: R }, 3.2);",
    '',
    '/* 3 · node thứ hai */',
    "tl.to(['#bRep','#cRep','#lRep'], { opacity: 1, duration: .7, ease: R }, 5.4);",
    '',
    '/* 4 · hai sự kiện. W hiện TRƯỚC ở 500; R hiện SAU ở 499 — bên TRÁI. */',
    'const W = document.createElement("div"); W.className = "mk filled";',
    'W.style.left = ' + X(500) + ' + "px"; stage.appendChild(W);',
    'const Rd = document.createElement("div"); Rd.className = "mk";',
    'Rd.style.left = ' + X(499) + ' + "px"; stage.appendChild(Rd);',
    'gsap.set([W, Rd], { opacity: 0 });',
    'tl.to(W, { opacity: 1, duration: .45, ease: R }, 7.6);',
    'tl.to(Rd, { opacity: 1, duration: .45, ease: R }, 9.4);',
    '',
    '/* 5 · LƯỢT MỘT — thứ tự TỚI: W rồi R. Phải → trái. */',
    ring('#rW', A0),
    ring('#rR', +(A0 + GAP).toFixed(2)),
    '',
    '/* 6 · LƯỢT HAI — thứ tự VỊ TRÍ: R rồi W. Trái → phải.',
    '   Cùng hằng số khoảng cách với lượt một, nên không có nhịp nào để so. */',
    ring('#rR', B0),
    ring('#rW', +(B0 + gapB).toFixed(2)),
    '',
    '/* 7 · khe hở: phần log replica chưa áp. Trung tính, dưới đường, không chạm dấu. */',
    "tl.to('#gap', { opacity: .85, duration: .5, ease: R }, " + +(B0 + gapB + 1.6).toFixed(2) + ');',
    '',
    '/* 8 · eventual consistency — replica áp tiếp tới 500. Chỉ transform. */',
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.1, ease: T }, " + +(B0 + gapB + 3.4).toFixed(2) + ');',
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.1, ease: T }, "
      + +(B0 + gapB + 3.4).toFixed(2) + ');',
    "tl.to('#gap', { opacity: 0, duration: .8, ease: T }, " + +(B0 + gapB + 3.9).toFixed(2) + ');',
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
    js,
    "window.__timelines['main'] = tl;",
    '<' + '/script>', '</body>', '</html>', ''];

  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), parts.join('\n'));
  console.log('wrote', id, dur + 's');
}

build({
  id: 'p-sw-order', dur: 28,
  note: '   Cú đổi cách nhìn thực hiện TRONG thế giới bao hàm. Hai dấu đứng yên; hai lượt duyệt\n'
      + '   nổ vòng sáng theo hai thứ tự ngược nhau. Không vật nào di chuyển, nên không có nhịp\n'
      + '   nào để so — khoảng giữa hai lần nổ là CÙNG một hằng số ở cả hai lượt.\n'
      + '   Khai trước (STEP3_SWEEP_PREDECLARATION.md): đây là ĐỔI TIÊU ĐIỂM, không phải L3;\n'
      + '   và lượt "thứ tự tới" KHÔNG tự neo được vì thế giới này cố ý không có trục thời gian.',
});

build({
  id: 'p-sw-neg-tempo', dur: 32, gapB: 4.0,
  note: '   NEGATIVE CONTROL cho R16. Lượt hai giãn GẤP ĐÔI lượt một, nên hai lượt cho hai nhịp\n'
      + '   khác nhau — lock A quay lại qua tempo thay vì qua độ dốc. Shot này TỒN TẠI ĐỂ TRƯỢT.',
});
