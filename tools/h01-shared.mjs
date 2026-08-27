/**
 * H01 — thế giới bao hàm dùng chung cho mọi generator chương.
 *
 * Tách ra để generator thứ hai không sao chép hình học. Ở lượt Step 3, hai prototype có hai
 * layout chữ số khác nhau vì mỗi cái giữ bản sao riêng — lỗi im lặng và chỉ lộ ra khi so
 * hai artifact cạnh nhau.
 *
 * Trục dọc chỉ nói NODE NÀO và không mang đại lượng nào. Đó là trục tự do mà R1 không có,
 * và là lý do hai đoạn bao tách được ra hai mức mà vẫn trung thực.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from './g01-world.mjs';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const OUT = path.join(ROOT, 'videos', 'H01-two-meanings-of-after', 'shots');

export const G = { x0: 170, x1: 910, yLine: 1000, yPri: 902, yRep: 1190, p0: 496.6, p1: 500.6 };
export const X = (p) => Math.round(G.x0 + (p - G.p0) / (G.p1 - G.p0) * (G.x1 - G.x0));

export const CSS = `
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

export const BASE_BODY = (opts = {}) => [
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

export const HELPERS = [
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

export function build({ id, dur, note, body, js, css = '', stretch = 1 }) {
  if (stretch !== 1) {
    const before = (js.match(/tl\.\w+\([^;]*?,\s*\d+(?:\.\d+)?\);/g) || []).length;
    js = js.replace(/(tl\.\w+\([^;]*?,\s*)(\d+(?:\.\d+)?)(\);)/g,
      (_, a, t, z) => a + (+t * stretch).toFixed(3) + z);
    const after = (js.match(/tl\.\w+\([^;]*?,\s*\d+(?:\.\d+)?\);/g) || []).length;
    if (before !== after || before === 0) {
      throw new Error('stretch: ' + id + ' — khớp ' + before + ' vị trí trước, ' + after + ' sau. Regex không an toàn.');
    }
    console.log('  stretch ' + id + ' ×' + stretch.toFixed(3) + ' trên ' + before + ' vị trí');
  }
  const parts = ['<!doctype html>', '<html lang="vi">', '<head>',
    '<meta charset="UTF-8" />', '<meta name="viewport" content="width=1080, height=1920" />',
    '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><' + '/script>',
    '<style>', BRAND, CSS, css, '',
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

