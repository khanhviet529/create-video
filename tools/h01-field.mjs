/**
 * H01 — trường (đồng hồ × vị trí trên lịch sử dùng chung).
 *
 * Không dùng lại ngữ pháp G01. Ở đây không có ô, không có khung cấp phát, không có dải quét.
 * Chỉ ba loại vật: ĐƯỜNG của một node · DẤU quan sát · PHÉP CHIẾU xuống một trục.
 *
 * R8 — kỷ luật quan trọng nhất của file này:
 *   Đường replica được sinh ra bằng cách TỊNH TIẾN đường primary, không phải bằng một hàm
 *   sinh riêng. Độ dốc bằng nhau vì hai đường LÀ MỘT đường, dịch đi. Nếu chúng bằng nhau chỉ
 *   vì tôi chỉnh tay cho khớp thì lần sửa sau sẽ làm lệch mà không ai biết. Package tự nói:
 *   primary [499…500] và replica [499…499,500] là CÙNG một đường, tới sau — không đi chậm hơn.
 *
 * Bảng màu, gán riêng cho video này (một video một cách gán):
 *   --ink       đường primary          --ink-mid   đường replica
 *   cả hai TRUNG TÍNH: không node nào hỏng, nên không node nào được mang màu báo động.
 *   --authoritative  hệ quy chiếu ĐỒNG HỒ      --boundary  hệ quy chiếu VỊ TRÍ
 *   hai hệ quy chiếu cân nhau về sức nặng: không hệ nào là "đúng", và đó chính là cú aha.
 */
import fs from 'node:fs';
import path from 'node:path';
import { BRAND } from './g01-world.mjs';

/* Hình học trường. Vị trí log tăng LÊN TRÊN — nó chỉ đi lên, không bao giờ lùi. */
export const FIELD = {
  x0: 150, x1: 950,        // trục đồng hồ
  yBot: 1360, yTop: 620,   // trục vị trí (yTop < yBot vì vị trí tăng lên trên)
  tMin: 0, tMax: 10,       // đơn vị đồng hồ tuỳ ý — đây là thứ tự, không phải phép đo
  pMin: 496.4, pMax: 501.6,
};

export const FIELD_CSS = `
#fx, #fy { position: absolute; background: var(--rule); }
#fx { left: ${FIELD.x0}px; top: ${FIELD.yBot}px; width: ${FIELD.x1 - FIELD.x0}px; height: 1.5px; }
#fy { left: ${FIELD.x0}px; top: ${FIELD.yTop}px; width: 1.5px; height: ${FIELD.yBot - FIELD.yTop}px; }

/* một đường node: nhiều đoạn tuyệt đối, KHÔNG tween left/top — chỉ transform và opacity */
.seg { position: absolute; height: 3px; transform-origin: left center; border-radius: 2px; }
.pline .seg { background: var(--ink); }
.rline .seg { background: var(--ink-mid); }

/* dấu quan sát — hai dấu CÙNG hình, cùng sức nặng: cả hai đều là câu trả lời đúng */
.mk { position: absolute; width: 26px; height: 26px; margin: -13px 0 0 -13px;
      background: var(--ground); box-shadow: inset 0 0 0 4px var(--ink); border-radius: 50%; }
.mk.filled { background: var(--ink); }

/* phép chiếu: một sợi từ dấu tới trục, và một vệt trên trục */
.pj { position: absolute; transform-origin: left center; }
.pj.v { width: 2px; transform-origin: center top; }
.pj.h { height: 2px; }
.clockfx { background: var(--authoritative); }
.posfx   { background: var(--boundary); }
.tick { position: absolute; border-radius: 2px; }
.tick.clockfx { width: 4px; height: 26px; margin-left: -2px; }
.tick.posfx   { height: 4px; width: 26px; margin-top: -2px; }

.axlbl { position: absolute; font-family: var(--font-label); font-size: 26px;
         letter-spacing: .14em; text-transform: uppercase; font-weight: 500; }
.mklbl { position: absolute; font-family: var(--font-value); font-size: 34px; color: var(--ink); }
`;

/* Hàm dựng chạy TRONG composition. Toạ độ tính lúc dựng; chỉ opacity/transform chạy lúc phát. */
export const FIELD_JS = `
const F = ${JSON.stringify(FIELD)};
const X = (t) => F.x0 + (t - F.tMin) / (F.tMax - F.tMin) * (F.x1 - F.x0);
const Y = (p) => F.yBot - (p - F.pMin) / (F.pMax - F.pMin) * (F.yBot - F.yTop);

/* Vẽ một đường bậc thang từ danh sách [t, p]. Trả về phần tử để tween opacity. */
function polyline(pts, cls) {
  const box = document.createElement('div');
  box.className = cls;
  box.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px';
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = [X(pts[i][0]), Y(pts[i][1])];
    const [bx, by] = [X(pts[i + 1][0]), Y(pts[i + 1][1])];
    const len = Math.hypot(bx - ax, by - ay);
    const ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    const d = document.createElement('div');
    d.className = 'seg';
    d.style.cssText = 'left:' + ax + 'px;top:' + (ay - 1.5) + 'px;width:' + len +
      'px;transform:rotate(' + ang + 'deg)';
    box.appendChild(d);
  }
  stage.appendChild(box);
  return box;
}

/* R8 — replica LÀ đường primary, dịch sang phải theo đồng hồ. Một phép tịnh tiến, không hơn. */
const shift = (pts, dt) => pts.map(([t, p]) => [t + dt, p]);

function mark(t, p, filled) {
  const d = document.createElement('div');
  d.className = 'mk' + (filled ? ' filled' : '');
  d.style.cssText = 'left:' + X(t) + 'px;top:' + Y(p) + 'px';
  stage.appendChild(d);
  return d;
}

/* Một phép chiếu: sợi từ dấu tới trục + vệt trên trục. Sợi vẽ sẵn đủ dài, hiện bằng scale. */
function projectClock(t, p) {
  const g = document.createElement('div');
  g.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px';
  const line = document.createElement('div');
  line.className = 'pj v clockfx';
  line.style.cssText = 'left:' + (X(t) - 1) + 'px;top:' + Y(p) + 'px;height:' + (F.yBot - Y(p)) + 'px';
  const tk = document.createElement('div');
  tk.className = 'tick clockfx';
  tk.style.cssText = 'left:' + X(t) + 'px;top:' + (F.yBot - 13) + 'px';
  g.appendChild(line); g.appendChild(tk); stage.appendChild(g);
  return { g, line, tk };
}
function projectPos(t, p) {
  const g = document.createElement('div');
  g.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px';
  const line = document.createElement('div');
  line.className = 'pj h posfx';
  line.style.cssText = 'left:' + F.x0 + 'px;top:' + (Y(p) - 1) + 'px;width:' + (X(t) - F.x0) + 'px';
  const tk = document.createElement('div');
  tk.className = 'tick posfx';
  tk.style.cssText = 'left:' + (F.x0 - 13) + 'px;top:' + Y(p) + 'px';
  g.appendChild(line); g.appendChild(tk); stage.appendChild(g);
  return { g, line, tk };
}
`;

export function makeProto(root) {
  return function proto({ id, dur, note, css = '', body = '', js }) {
    const parts = ['<!doctype html>', '<html lang="vi">', '<head>',
      '<meta charset="UTF-8" />', '<meta name="viewport" content="width=1080, height=1920" />',
      '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><' + '/script>',
      '<style>', BRAND, FIELD_CSS, '',
      '/* ---------------------------------------------------------------------------',
      note, '--------------------------------------------------------------------------- */',
      css, '</style>', '</head>', '<body>',
      '<div id="root" data-composition-id="main" data-start="0" data-duration="' + dur + '"',
      '     data-width="1080" data-height="1920">',
      '  <div id="stage" class="clip" data-start="0" data-duration="' + dur + '" data-track-index="0">',
      '    <div id="fx"></div>', '    <div id="fy"></div>',
      body, '  </div>', '</div>', '',
      '<script>',
      'window.__timelines = window.__timelines || {};',
      'const tl = gsap.timeline({ paused: true });',
      "const R = 'power3.out', T = 'power2.inOut';",
      "const stage = document.getElementById('stage');",
      FIELD_JS, js,
      "window.__timelines['main'] = tl;",
      '<' + '/script>', '</body>', '</html>', ''];
    const dir = path.join(root, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), parts.join('\n'));
    console.log('wrote', id, dur + 's');
  };
}
