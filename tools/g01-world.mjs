/**
 * G01 — the shared persistent world.
 *
 * Extracted so every generator draws the same world from one source. The contract is in
 * videos/G01-bloat-not-row-count/CHAPTER_ARCHITECTURE.md §1, and duplicating it across
 * generators is exactly how a colour quietly changes meaning between chapters.
 *
 *   ô đặc ink          a LIVE row version
 *   ô đặc lost         a DEAD version, sitting where it died
 *   ô viền rule-bright an EMPTY slot — reusable INSIDE the table
 *   khung ngoài ink-dim the ALLOCATED extent. Only ever grows, except on a rewrite.
 *                      A DIFFERENT value from the empty-slot ring on purpose: two meanings
 *                      must not share one colour, and separating them also makes the
 *                      boundary measurable by pixel value.
 *   vạch teal          what the live data needs. NEVER changes length.
 *   vạch vermilion     what has been allocated.
 *   ochre              a sweep event.
 *
 * The physical rule every probe obeys: an UPDATE does not edit a cell in place. It kills the
 * old version WHERE IT IS and writes a new live version SOMEWHERE ELSE. The frame grows only
 * when the interior runs out of room.
 *
 * Frames are four bars and grow by transform only — animating left/top/width/height snaps to
 * integer device pixels and stutters under the seek-by-frame capture engine.
 */
import fs from 'node:fs';
import path from 'node:path';

export const BRAND = `/* @brand:start */
:root {
  --ground: #0C0D0F; --ground-lift: #14161A;
  --ink: #EDEAE4; --ink-mid: #9AA0A6; --ink-dim: #8B9198; --ink-ghost: #3A3E42;
  --rule: #23272A; --rule-bright: #3D4348; --hair: 1.5px;
  --authoritative: #C9A227; --stale: #E0533D; --lost: #6A6F74;
  --boundary: #4E8C7D; --pressure: #B4623A; --counterfactual: #7A8086;
  --font-value: "IBM Plex Mono", ui-monospace, monospace;
  --font-label: "IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif;
  --t-hero: 200px; --t-value: 64px; --t-body: 36px; --t-label: 26px; --track-label: 0.18em;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { overflow: hidden; background: var(--ground); color: var(--ink); font-family: var(--font-label); }
.label { font-family: var(--font-label); font-size: var(--t-label); letter-spacing: var(--track-label);
         text-transform: uppercase; color: var(--ink-dim); font-weight: 500; }
/* @brand:end */

html, body { width: 1080px; height: 1920px; }
#stage { position: absolute; inset: 0; }

.cell { position: absolute; border-radius: 1px; }
.live { background: var(--ink); }
.dead { background: var(--lost); }
.free { background: transparent; box-shadow: inset 0 0 0 4px var(--rule-bright); } /* Ô TRỐNG */
/* a slot whose DEPICTION has been lifted out to be counted. The slot is still occupied —
   nothing in the relation moved, and the ghost is what says so. */
.ghost { background: transparent; box-shadow: inset 0 0 0 3px var(--lost); }

.frame { position: absolute; left: 0; top: 0; }
.fbar { position: absolute; background: var(--ink-dim); }   /* KHUNG CẤP PHÁT */
.fbar.h { height: 3px; }
.fbar.v { width: 3px; transform-origin: left top; }
#need .fbar { background: var(--boundary); }

.cap { position: absolute; font-family: var(--font-label); font-size: 26px;
       letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; }
.val { position: absolute; font-family: var(--font-value); font-size: 54px; }

/* the analytical register — a different band of the frame, with its own rule */
#analytic { position: absolute; left: 90px; top: 1362px; width: 900px; height: 1.5px;
            background: var(--counterfactual); opacity: .5; }
/* a sweep event travelling down the allocation */
.sweep { position: absolute; background: var(--authoritative); opacity: .22; }
/* the visibility horizon held by an old snapshot */
.horizon { position: absolute; left: 76px; width: 928px;
           height: 3px;
           background: repeating-linear-gradient(90deg, var(--boundary) 0 16px, transparent 16px 28px); }

/* the measurement register: bars on an axis. A quantity belongs on an axis, never as a
   frame drawn around a subset of cells — that reads as a physical partition, which is false. */
#axis { position: absolute; left: 90px; top: 300px; width: 900px; height: 1.5px; background: var(--rule); }
.bar { position: absolute; left: 90px; height: 22px; transform-origin: left center; }
#bNeed { top: 246px; background: var(--boundary); }
#bAlloc { top: 316px; background: var(--stale); }
#drop { position: absolute; top: 246px; width: 1.5px; height: 112px; background: var(--boundary); opacity: .55; }`;

export const WORLD_JS = `
const COLS = W_COLS, CELL = W_CELL, GAP = 10, PITCH = CELL + GAP;
const X0 = W_X0, Y0 = W_Y0;
const LIVE_N = W_LIVE;
const slotXY = (i) => [X0 + (i % COLS) * PITCH, Y0 + Math.floor(i / COLS) * PITCH];

const stage = document.getElementById('stage');
const world = document.getElementById('world');
const cells = [];

function makeCell(i, state) {
  const [x, y] = slotXY(i);
  const d = document.createElement('div');
  d.className = 'cell ' + state;
  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + CELL + 'px;height:' + CELL + 'px';
  world.appendChild(d);
  cells[i] = { el: d, state };
  return d;
}
function setState(i, state) {
  const c = cells[i];
  if (!c) return;
  c.el.className = 'cell ' + state;
  c.state = state;
}
const rowsFor = (n) => Math.ceil(n / COLS);
function frameFor(n) {
  return { x: X0 - 14, y: Y0 - 14, w: COLS * PITCH - GAP + 28, h: rowsFor(n) * PITCH - GAP + 28 };
}
function applyFrame(el, n) {
  const f = frameFor(n);
  el.innerHTML = '';
  const mk = (cls, css) => {
    const d = document.createElement('div');
    d.className = 'fbar ' + cls; d.style.cssText = css; el.appendChild(d); return d;
  };
  const top = mk('h', 'left:' + f.x + 'px;top:' + f.y + 'px;width:' + f.w + 'px');
  const bot = mk('h', 'left:' + f.x + 'px;top:' + f.y + 'px;width:' + f.w + 'px');
  const lft = mk('v', 'left:' + f.x + 'px;top:' + f.y + 'px;height:1px');
  const rgt = mk('v', 'left:' + (f.x + f.w - 3) + 'px;top:' + f.y + 'px;height:1px');
  gsap.set(bot, { y: f.h - 3 });
  gsap.set([lft, rgt], { scaleY: f.h });
  el._bars = { top, bot, lft, rgt };
}
function growFrame(tl, el, n, at, duration) {
  const f = frameFor(n), b = el._bars;
  if (!b) return;
  tl.to(b.bot, { y: f.h - 3, duration: duration || 0.45, ease: T }, at);
  tl.to([b.lft, b.rgt], { scaleY: f.h, duration: duration || 0.45, ease: T }, at);
}
/** one element per value, exactly one visible at a time — textContent is never mutated */
const COUNTER_SLOTS = new Set();
function counter(left, top, color, values, times) {
  // Two sequences in one slot stack: each call only hides its own values. One slot, one call.
  const slot = left + ',' + top;
  if (COUNTER_SLOTS.has(slot)) {
    throw new Error('counter(): ô ' + slot + ' đã có một dãy. Gộp mọi giá trị của cùng một'
      + ' ô vào MỘT lời gọi — hai lời gọi cùng ô sẽ hiện đè lên nhau.');
  }
  COUNTER_SLOTS.add(slot);
  values.forEach((v, k) => {
    const d = document.createElement('div');
    d.className = 'val';
    d.setAttribute('data-layout-allow-overlap', '');
    const col = Array.isArray(color) ? color[k] : color;
    d.style.cssText = 'left:' + left + 'px;top:' + top + 'px;color:' + col + ';opacity:0';
    d.textContent = String(v);
    stage.appendChild(d);
    tl.set(d, { opacity: 1 }, times[k]);
    // hide a frame BEFORE the next value shows: two gsap.set calls at an identical time
    // resolved inconsistently under frame-by-frame seeking and left both digits on screen.
    if (k < values.length - 1) tl.set(d, { opacity: 0 }, times[k + 1] - 0.02);
  });
}
`;

export function makeProto(root) {
  return function proto({ id, dur, note, css = '', body = '', js, world = {} }) {
    const W = { cols: 11, cell: 76, x0: 90, y0: 380, live: 44, ...world };
    const worldJs = WORLD_JS
      .replace('W_COLS', String(W.cols)).replace('W_CELL', String(W.cell))
      .replace('W_X0', String(W.x0)).replace('W_Y0', String(W.y0))
      .replace('W_LIVE', String(W.live));

    const parts = [];
    parts.push('<!doctype html>', '<html lang="vi">', '<head>',
      '<meta charset="UTF-8" />', '<meta name="viewport" content="width=1080, height=1920" />',
      '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><' + '/script>',
      '<style>', BRAND, '',
      '/* ---------------------------------------------------------------------------',
      note, '--------------------------------------------------------------------------- */',
      css, '</style>', '</head>', '<body>',
      '<div id="root" data-composition-id="main" data-start="0" data-duration="' + dur + '"',
      '     data-width="1080" data-height="1920">',
      '  <div id="stage" class="clip" data-start="0" data-duration="' + dur + '" data-track-index="0">',
      '    <div id="alloc" class="frame"></div>',
      '    <div id="need" class="frame"></div>',
      '    <div id="world"></div>',
      body, '  </div>', '</div>', '',
      '<script>',
      "window.__timelines = window.__timelines || {};",
      'const tl = gsap.timeline({ paused: true });',
      "const R = 'power3.out', T = 'power2.inOut';",
      worldJs, js,
      "window.__timelines['main'] = tl;",
      '<' + '/script>', '</body>', '</html>', '');

    const dir = path.join(root, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), parts.join('\n'));
    console.log('wrote', id, dur + 's');
  };
}
