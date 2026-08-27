/**
 * G01 Step 3 — hero visual R&D.
 *
 * One shared world, then probes against it. Every probe obeys the same physical rule, which
 * is the whole point of the exercise:
 *
 *   an UPDATE does NOT edit a cell in place. It writes a NEW live version somewhere else and
 *   leaves the old one dead where it was.
 *
 * The stable thing is therefore a QUANTITY — how much room the live versions need — not a
 * position. That quantity is drawn as a reference frame, and bloat is the distance between it
 * and the allocated frame. That is the package's own definition of bloat.
 *
 * Frames are four bars, not one box, and they grow by transform only. Animating
 * left/top/width/height snaps to integer device pixels and stutters under the seek-by-frame
 * capture engine — the gate caught exactly that on the first pass.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/creative-video/videos/G01-bloat-not-row-count/shots';

const BRAND = `/* @brand:start */
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

/* ---- the world -------------------------------------------------------------
   A cell is one physical tuple slot. Colour is state, and state is the only thing
   colour ever means here:
     ink        a LIVE version
     lost       a DEAD version — still occupying its slot
     ghost ring an EMPTY slot the table may write into again (reusable INSIDE)
   The allocated frame is a DIFFERENT geometric object from cell state. That is what
   keeps "reusable inside" and "returned to the OS" from ever looking like one event. */
.cell { position: absolute; border-radius: 1px; }
.live { background: var(--ink); }
.dead { background: var(--lost); }
.free { background: transparent; box-shadow: inset 0 0 0 3px var(--rule-bright); }

.frame { position: absolute; left: 0; top: 0; }
.fbar { position: absolute; background: var(--rule-bright); }
.fbar.h { height: 3px; }
.fbar.v { width: 3px; transform-origin: left top; }
#need .fbar { background: var(--boundary); }

.cap { position: absolute; font-family: var(--font-label); font-size: 26px;
       letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; }
.val { position: absolute; font-family: var(--font-value); font-size: 54px; }`;

const WORLD_JS = `
/* geometry — one place, so every probe measures the same world */
const COLS = W_COLS, CELL = W_CELL, GAP = 10, PITCH = CELL + GAP;
const X0 = W_X0, Y0 = W_Y0;
const LIVE_N = W_LIVE;             // the live population. Its SIZE never changes.
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
/** Four bars positioned once; every later change is a transform. */
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
/** A counter that never mutates textContent from a callback: one element per value. */
function counter(left, top, color, values, times) {
  values.forEach((v, k) => {
    const d = document.createElement('div');
    d.className = 'val';
    // Stacked on purpose: one element per value, exactly one visible at a time. Mutating
    // textContent from a callback is what this pattern exists to avoid.
    d.setAttribute('data-layout-allow-overlap', '');
    d.style.cssText = 'left:' + left + 'px;top:' + top + 'px;color:' + color + ';opacity:0';
    d.textContent = String(v);
    stage.appendChild(d);
    tl.set(d, { opacity: 1 }, times[k]);
    // hide a frame BEFORE the next value shows. Two gsap.set calls at an identical time
    // resolved inconsistently under frame-by-frame seeking and left both digits on screen.
    if (k < values.length - 1) tl.set(d, { opacity: 0 }, times[k + 1] - 0.02);
  });
}
`;

function proto({ id, dur, note, css = '', body = '', js, world = {} }) {
  const W = { cols: 11, cell: 76, x0: 90, y0: 380, live: 44, ...world };
  const worldJs = WORLD_JS
    .replace('W_COLS', String(W.cols)).replace('W_CELL', String(W.cell))
    .replace('W_X0', String(W.x0)).replace('W_Y0', String(W.y0))
    .replace('W_LIVE', String(W.live));
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><\/script>
<style>
${BRAND}

/* ---------------------------------------------------------------------------
${note}
--------------------------------------------------------------------------- */
${css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${dur}"
     data-width="1080" data-height="1920">
  <div id="stage" class="clip" data-start="0" data-duration="${dur}" data-track-index="0">
    <div id="alloc" class="frame"></div>
    <div id="need" class="frame"></div>
    <div id="world"></div>
${body}
  </div>
</div>

<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
const R = 'power3.out', T = 'power2.inOut';
${worldJs}
${js}
window.__timelines['main'] = tl;
<\/script>
</body>
</html>
`;
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('wrote', id, dur + 's');
}

/* ══════════════════ R1 — persistent world, 30s ═══════════════════════════════ */
proto({
  id: 'p1-world-30s', dur: 30,
  note: `   R1 — can one world carry the mechanism for 30 seconds without resetting?

   Progressive disclosure, one idea at a time, each result left on screen:
     0-3    the live population exists and the allocation fits it exactly
     3-19   updates. Each darkens a slot to dead and writes a live version ELSEWHERE.
            The allocation grows only when the interior runs out of room.
     19-21  the reference frame appears: the room the live versions actually need
     21-25  VACUUM — dead slots really do empty
     25-30  the allocated frame does not move, and later writes land inside it

   The only text is a count, because "the live population never changes" is a claim the
   viewer has to be able to CHECK, and counting 48 cells by eye is not checking.`,
  css: `#cLive { left: 108px; top: 250px; color: var(--ink); }
#cDead { left: 430px; top: 250px; color: var(--lost); }
#cAlloc { left: 752px; top: 250px; color: var(--ink-dim); }`,
  body: `    <div id="cLive" class="cap">phiên bản sống</div>
    <div id="cDead" class="cap">phiên bản chết</div>
    <div id="cAlloc" class="cap">ô đã cấp</div>`,
  js: `
let live = [];
for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }
let allocated = LIVE_N, nextFree = LIVE_N, dead = 0;
const alloc = document.getElementById('alloc'), need = document.getElementById('need');
applyFrame(alloc, allocated);
applyFrame(need, LIVE_N);          // the reference. Never grown, because live count is fixed.

gsap.set(['#world', '#alloc', '#need', '#cLive', '#cDead', '#cAlloc'], { opacity: 0 });

tl.to('#world', { opacity: 1, duration: .7, ease: R }, 0.3)
  .to('#alloc', { opacity: 1, duration: .5, ease: R }, 1.1)
  .to(['#cLive', '#cAlloc'], { opacity: 1, duration: .4, ease: R }, 1.6);

const deadV = [], deadT = [], allocV = [], allocT = [];
const UPDATES = 26;
for (let u = 0; u < UPDATES; u++) {
  const t = 3.0 + u * 0.62;
  const pick = live[(u * 7) % live.length];
  const target = nextFree;
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(target), null, t + 0.10);
  live[live.indexOf(pick)] = target;
  nextFree += 1; dead += 1;
  deadV.push(dead); deadT.push(t + 0.12);
  if (nextFree > allocated) {
    allocated = rowsFor(nextFree) * COLS;
    growFrame(tl, alloc, allocated, t + 0.14);
    allocV.push(allocated); allocT.push(t + 0.20);
  }
}
// LIVE_N, never a literal: the whole claim is that this number equals the number of ink
// cells on screen, and a hardcoded 48 beside 44 cells would teach a count that is wrong.
counter(108, 286, '#EDEAE4', [LIVE_N], [1.7]);
counter(430, 286, '#6A6F74', deadV.concat([0]), deadT.concat([24.2]));
counter(752, 286, '#9AA0A6', [LIVE_N].concat(allocV), [1.7].concat(allocT));
tl.to('#cDead', { opacity: 1, duration: .4, ease: R }, 3.4);

/* the reference region — how much room the live data needs — arrives late, so it lands as
   an answer to a question the viewer has already started asking */
tl.to('#need', { opacity: 1, duration: .6, ease: R }, 19.6);

/* VACUUM: dead slots empty for real. No tween touches the allocation frame here. */
for (let i = 0; i < nextFree; i++) {
  tl.call(((idx) => () => { if (cells[idx] && cells[idx].state === 'dead') setState(idx, 'free'); })(i),
    null, 21.6 + (i / nextFree) * 2.2);
}

/* later writes land in slots the table already owns */
const freedList = [];
for (let u = 0; u < UPDATES; u++) { const q = (u * 7) % LIVE_N; if (!freedList.includes(q)) freedList.push(q); }
for (let u = 0; u < 6; u++) {
  const t = 25.4 + u * 0.7;
  const pick = live[(u * 5) % live.length];
  const target = freedList[u % freedList.length];
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => setState(i, 'live'))(target), null, t + 0.10);
  live[live.indexOf(pick)] = target;
}
`,
});

/* ══════════════════ R2a — reusable INSIDE ════════════════════════════════════ */
proto({
  id: 'p2a-reuse-inside', dur: 10,
  note: `   R2 A — space becomes reusable INSIDE the existing allocation.

   The operation touches CELL STATE only. There is no tween on the allocation frame anywhere
   in this file, so the boundary holding still is a fact about the timeline rather than a
   judgement about the render.`,
  js: `
let live = [];
for (let i = 0; i < 84; i++) { makeCell(i, i % 7 < 4 ? 'live' : 'dead'); if (i % 7 < 4) live.push(i); }
applyFrame(document.getElementById('alloc'), 84);
applyFrame(document.getElementById('need'), 48);
gsap.set('#need', { opacity: 0 });

for (let i = 0; i < 84; i++) {
  tl.call(((idx) => () => { if (cells[idx].state === 'dead') setState(idx, 'free'); })(i),
    null, 1.2 + (i / 84) * 2.6);
}
for (let u = 0; u < 10; u++) {
  const t = 5.4 + u * 0.42;
  const pick = live[(u * 3) % live.length];
  const target = 4 + (u * 7);
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => setState(i, 'live'))(target), null, t + 0.08);
  live[live.indexOf(pick)] = target;
}
`,
});

/* ══════════════════ R2b — returned to the OS ═════════════════════════════════ */
proto({
  id: 'p2b-return-to-os', dur: 10,
  note: `   R2 B — the allocation itself becomes smaller.

   A different operation in every respect: a SECOND container exists at the same time — that
   is the extra disk VACUUM FULL needs — the live versions are copied into it packed, the old
   container goes away, and only then is the boundary smaller.

   Cell state is not what changes here. The number of containers does, and then the frame
   does. If a viewer can tell these two probes apart with no words, the distinction the
   package calls load-bearing is carried by the picture.`,
  body: `    <div id="copy" class="frame"></div>`,
  js: `
for (let i = 0; i < 84; i++) makeCell(i, i % 7 < 4 ? 'live' : 'dead');
applyFrame(document.getElementById('alloc'), 84);
applyFrame(document.getElementById('need'), 48);
gsap.set('#need', { opacity: 0 });

const copy = document.getElementById('copy');
applyFrame(copy, 48);
gsap.set(copy, { x: 0, y: 760, opacity: 0 });
tl.to(copy, { opacity: 1, duration: .5, ease: R }, 1.0);

const copyCells = [];
let w = 0;
for (let i = 0; i < 84; i++) {
  if (i % 7 >= 4) continue;
  const [x, y] = slotXY(w);
  const d = document.createElement('div');
  d.className = 'cell live';
  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + CELL + 'px;height:' + CELL + 'px;opacity:0';
  world.appendChild(d);
  gsap.set(d, { y: 760 });
  copyCells.push(d);
  tl.to(d, { opacity: 1, duration: .18, ease: R }, 1.8 + w * 0.045);
  w++;
}

const oldCells = cells.filter(Boolean).map((c) => c.el);
tl.to(oldCells, { opacity: 0, duration: .5, ease: 'power2.in' }, 5.7);
tl.to('#alloc', { opacity: 0, duration: .5, ease: 'power2.in' }, 5.9);
tl.to(copyCells.concat([copy]), { y: 0, duration: .9, ease: T }, 6.9);
`,
});

/* ══════════════════ R3a — boundary past the viewport ═════════════════════════ */
proto({
  id: 'p3a-boundary-offscreen', dur: 12,
  world: { y0: 640, live: 33 },
  note: `   R3 A — content stays at a fixed size and the allocation grows past the frame edge.

   The risk under test: a mute viewer may read this as the camera moving closer rather than
   the object getting bigger. Nothing here is scaled, so if it reads as a zoom the reading is
   wrong — but the reading is what matters, not the transform.`,
  js: `
let live = [];
for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }
let allocated = LIVE_N, nextFree = LIVE_N;
const alloc = document.getElementById('alloc');
applyFrame(alloc, allocated);
applyFrame(document.getElementById('need'), LIVE_N);
gsap.set('#need', { opacity: 0 });

for (let u = 0; u < 66; u++) {
  const t = 0.6 + u * 0.155;
  const pick = live[(u * 7) % live.length];
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.04);
  live[live.indexOf(pick)] = nextFree;
  nextFree += 1;
  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.05, 0.2); }
}
tl.to('#need', { opacity: 1, duration: .6, ease: R }, 11.0);
`,
});

/* ══════════════════ R3b — boundary in frame, fixed measure ═══════════════════ */
proto({
  id: 'p3b-boundary-measured', dur: 12,
  note: `   R3 B — the allocation stays inside the frame and a fixed reference bar carries the scale.

   The teal bar is the room the live versions need. It never changes length, because the live
   COUNT never changes. Growth is read against it rather than against the frame edge, so
   there is nothing here a viewer could mistake for camera movement.`,
  css: `#gauge { position: absolute; left: 108px; top: 300px; width: 864px; height: 26px;
          box-shadow: inset 0 0 0 2px var(--rule-bright); }
#gNeed { position: absolute; left: 108px; top: 300px; height: 26px; background: var(--boundary);
         transform-origin: left center; }
#gAlloc { position: absolute; left: 108px; top: 336px; height: 12px; background: var(--stale);
          transform-origin: left center; }`,
  body: `    <div id="gauge"></div><div id="gNeed"></div><div id="gAlloc"></div>`,
  js: `
let live = [];
for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }
let allocated = LIVE_N, nextFree = LIVE_N;
const alloc = document.getElementById('alloc');
applyFrame(alloc, allocated);
applyFrame(document.getElementById('need'), LIVE_N);
gsap.set('#need', { opacity: 0 });

const BASE = 864 / 3;              // width representing the live-data requirement
gsap.set('#gNeed', { width: BASE });
gsap.set('#gAlloc', { width: BASE });

for (let u = 0; u < 40; u++) {
  const t = 0.8 + u * 0.26;
  const pick = live[(u * 7) % live.length];
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.06);
  live[live.indexOf(pick)] = nextFree;
  nextFree += 1;
  if (nextFree > allocated) {
    allocated = rowsFor(nextFree) * COLS;
    const f = frameFor(allocated);
    const sc = Math.min(1, 1240 / (f.h + 60));
    growFrame(tl, alloc, allocated, t + 0.08, 0.3);
    tl.to(['#world', '#alloc'], { scale: sc, transformOrigin: '108px 430px', duration: .3, ease: T }, t + 0.08);
    tl.to('#gAlloc', { scaleX: allocated / LIVE_N, duration: .3, ease: T }, t + 0.08);
  }
}
tl.to('#need', { opacity: 1, duration: .6, ease: R }, 11.0);
`,
});

/* ══════════════════ R4a — physically plausible churn ═════════════════════════ */
proto({
  id: 'p4a-churn-interleaved', dur: 12,
  note: `   R4 A — dead versions lie where they died, interleaved with live ones.

   This is what the storage actually looks like, and it is what makes "the next write goes
   into a slot that was freed" a consequence rather than a claim. The cost under measurement:
   whether 20% is countable at all when the dead are scattered.`,
  js: `
let live = [];
for (let i = 0; i < 96; i++) { makeCell(i, 'live'); live.push(i); }
const alloc = document.getElementById('alloc');
applyFrame(alloc, 96);
applyFrame(document.getElementById('need'), 96);
gsap.set('#need', { opacity: 0 });
let nextFree = 96, allocated = 96;
for (let u = 0; u < 24; u++) {
  const t = 0.8 + u * 0.42;
  const pick = live[(u * 37 + 13) % live.length];
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.08);
  live[live.indexOf(pick)] = nextFree; nextFree += 1;
  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.1, 0.3); }
}
`,
});

/* ══════════════════ R4b — analytic view, declared as a level change ══════════ */
proto({
  id: 'p4b-churn-aggregated', dur: 12,
  note: `   R4 B — the same run, then an ANALYTIC view where the dead are gathered.

   The gathering is shown as a transformation with its own motion: the scattered dead cells
   TRAVEL to a block. That travel is the honest part — it says the arrangement changed for the
   sake of counting and is not where the tuples are. If it still reads as physical layout, the
   variant is rejected.`,
  css: `#lvl { left: 108px; top: 250px; color: var(--counterfactual); }`,
  body: `    <div id="lvl" class="cap">cùng dữ liệu &middot; xếp lại để đếm</div>`,
  js: `
let live = [];
for (let i = 0; i < 96; i++) { makeCell(i, 'live'); live.push(i); }
const alloc = document.getElementById('alloc');
applyFrame(alloc, 96);
applyFrame(document.getElementById('need'), 96);
gsap.set(['#need', '#lvl'], { opacity: 0 });
let nextFree = 96, allocated = 96;
const deadIdx = [];
for (let u = 0; u < 24; u++) {
  const t = 0.5 + u * 0.28;
  const pick = live[(u * 37 + 13) % live.length];
  deadIdx.push(pick);
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.06);
  live[live.indexOf(pick)] = nextFree; nextFree += 1;
  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.08, 0.25); }
}

tl.to('#lvl', { opacity: 1, duration: .4, ease: R }, 7.6);
deadIdx.forEach((idx, k) => {
  const col = k % 6, row = Math.floor(k / 6);
  const tx = 700 + col * PITCH, ty = 1330 + row * PITCH;
  const [sx, sy] = slotXY(idx);
  tl.to(cells[idx].el, { x: tx - sx, y: ty - sy, duration: .8, ease: T }, 8.0 + k * 0.03);
});
`,
});

/* ══════════════ p5 — measurement moved OUT of the cell world ═════════════════
   The Step 3 world drew "how much room the live data needs" as a teal FRAME around the top
   rows. Measured against its own contents, that frame was not merely ambiguous — it enclosed
   empty slots and excluded live cells sitting below it. It read as a physical partition of
   the relation, which is false: live tuple versions are distributed through the whole
   allocated extent.

   The fix is not a caption. It is a change of register. A quantity belongs on an axis, not
   around objects:

     RULER (top)     two bars from one origin — a MEASUREMENT. Teal is what the live data
                     needs and never changes length, because the live count never changes.
                     Vermilion is what has been allocated. The gap between their right ends
                     is bloat, and it is a distance, not a label.
     WORLD (middle)  ONE frame — the physical allocated extent — holding tuple versions
                     wherever they physically are.
     (bottom)        left empty here; it is where the analytical view lands when a count is
                     needed. See p4b.

   Bars on an axis and cells in a frame are different geometry, so the two levels cannot be
   confused for one another. */
proto({
  id: 'p5-measure-register', dur: 18,
  world: { y0: 520 },
  note: `   Corrected relationship: measurement lives on a ruler, physical occupancy lives in the
   world, and no frame is drawn around any subset of cells.`,
  css: `#axis { position: absolute; left: 90px; top: 300px; width: 900px; height: 1.5px;
        background: var(--rule); }
.bar { position: absolute; left: 90px; height: 22px; transform-origin: left center; }
#bNeed { top: 246px; background: var(--boundary); }
#bAlloc { top: 316px; background: var(--stale); }
#drop { position: absolute; top: 246px; width: 1.5px; height: 112px; background: var(--boundary);
        opacity: .55; }
.rl { position: absolute; font-family: var(--font-label); font-size: 24px; letter-spacing: .14em;
      text-transform: uppercase; font-weight: 500; }
#lNeed { left: 90px; top: 214px; color: var(--boundary); }
#lAlloc { left: 90px; top: 352px; color: var(--stale); }`,
  body: `    <div id="axis"></div>
    <div class="bar" id="bNeed"></div>
    <div class="bar" id="bAlloc"></div>
    <div id="drop"></div>
    <div id="lNeed" class="rl">chỗ dữ liệu sống cần</div>
    <div id="lAlloc" class="rl">chỗ đã cấp</div>`,
  js: `
const UNIT = 10.4;                 // px per slot on the ruler
let live = [];
for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }
let allocated = LIVE_N, nextFree = LIVE_N;
const alloc = document.getElementById('alloc');
applyFrame(alloc, allocated);
document.getElementById('need').remove();   // no second frame in the world. Ever.

gsap.set('#bNeed', { width: LIVE_N * UNIT });
gsap.set('#bAlloc', { width: LIVE_N * UNIT });
gsap.set('#drop', { x: LIVE_N * UNIT });    // the reference line sits at what live data needs
gsap.set(['#axis', '#bNeed', '#bAlloc', '#drop', '#lNeed', '#lAlloc'], { opacity: 0 });
gsap.set('#world', { opacity: 0 });

tl.to('#world', { opacity: 1, duration: .6, ease: R }, 0.3)
  .to(['#axis', '#lNeed', '#bNeed'], { opacity: 1, duration: .5, ease: R }, 1.0)
  .to(['#lAlloc', '#bAlloc'], { opacity: 1, duration: .5, ease: R }, 1.6);

/* churn: versions die where they are, new ones are written elsewhere */
for (let u = 0; u < 33; u++) {
  const t = 2.6 + u * 0.24;
  const pick = live[(u * 37 + 13) % live.length];
  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);
  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.05);
  live[live.indexOf(pick)] = nextFree;
  nextFree += 1;
  if (nextFree > allocated) {
    allocated = rowsFor(nextFree) * COLS;
    growFrame(tl, alloc, allocated, t + 0.06, 0.22);
    tl.to('#bAlloc', { scaleX: allocated / LIVE_N, duration: .22, ease: T }, t + 0.06);
  }
}
/* the reference line stays where it always was — that is the whole point */
tl.to('#drop', { opacity: 1, duration: .5, ease: R }, 11.2);

/* VACUUM: cell state changes, allocated bar does not move a pixel */
for (let i = 0; i < nextFree; i++) {
  tl.call(((idx) => () => { if (cells[idx] && cells[idx].state === 'dead') setState(idx, 'free'); })(i),
    null, 12.6 + (i / nextFree) * 2.0);
}
`,
});

console.log('G01 prototypes done');
