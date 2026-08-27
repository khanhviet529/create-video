/**
 * G01 — production build. Eleven chapters of one persistent world.
 *
 * Continuity is not a promise here, it is a construction: the simulation runs in Node, and
 * each chapter's HTML is emitted with the EXACT closing state of the chapter before it. A
 * chapter cannot drift from its predecessor because it never computes its own start.
 *
 * Timing comes from voice/shot_timing.json — measured beats of the real narration
 * (namtre_v2 @ speed 1.00, 156.69s). Nothing here is estimated.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { BRAND, makeProto } from './g01-world.mjs';

const V = 'D:/creative-video/videos/G01-bloat-not-row-count';
const T = JSON.parse(fs.readFileSync(V + '/voice/shot_timing.json', 'utf8')).shots;
const proto = makeProto(V + '/shots');

const COLS = 11, LIVE_N = 88;

/* ---------------------------------------------------------------------------
   The world, simulated once. Every chapter's opening state is a snapshot of it.
   The physical rule is here and nowhere else: an update kills a version WHERE IT IS and
   writes a new one into the first free slot, appending only when nothing is free.
--------------------------------------------------------------------------- */
class World {
  constructor(n) {
    this.cells = Array.from({ length: n }, () => 'live');
    this.live = Array.from({ length: n }, (_, i) => i);
    this.next = n;
    this.u = 0;
  }
  get alloc() { return Math.ceil(this.next / COLS) * COLS; }
  firstFree() {
    for (let i = 0; i < this.next; i++) if (this.cells[i] === 'free') return i;
    return this.next++;
  }
  /** one UPDATE: old version dies in place, new version is written somewhere else */
  update() {
    const pick = this.live[(this.u * 37 + 13) % this.live.length];
    this.u += 1;
    this.cells[pick] = 'dead';
    const target = this.firstFree();
    this.cells[target] = 'live';
    this.live[this.live.indexOf(pick)] = target;
    return { pick, target };
  }
  /** ordinary VACUUM: dead versions really are removed, and their slots become reusable
   *  INSIDE the table. Nothing about the allocated extent changes. */
  vacuum() {
    const freed = [];
    for (let i = 0; i < this.next; i++) if (this.cells[i] === 'dead') { this.cells[i] = 'free'; freed.push(i); }
    return freed;
  }
  deadCount() { return this.cells.slice(0, this.next).filter((s) => s === 'dead').length; }
  /** VACUUM FULL: the table is rewritten. The only operation that reduces the extent. */
  rewrite() {
    const n = this.live.length;
    this.cells = Array.from({ length: n }, () => 'live');
    this.live = Array.from({ length: n }, (_, i) => i);
    this.next = n;
  }
  /* live carries its ORDER, not just its membership. pickLive indexes into it, and the
     order is a history of in-place replacements — rebuilding it by scanning cells in index
     order gives a different sequence of picks, so the chapter diverges from the snapshot the
     next chapter inherits. */
  snap() { return { cells: this.cells.slice(0, this.next), alloc: this.alloc, next: this.next, live: this.live.slice() }; }
}

const w = new World(LIVE_N);
const START = {};                    // chapter id -> opening snapshot
const PLAN = {};                     // chapter id -> what it does

/* CH1 has no world. CH2 is where it is born. */
START.CH2 = w.snap();
const CH2_UPDATES = 18;              // 18 dead on 88 live ≈ the 20% threshold
PLAN.CH2 = { updates: CH2_UPDATES };
for (let i = 0; i < CH2_UPDATES; i++) w.update();

START.CH3 = w.snap();                // threshold reached; the analytical round trip counts it
PLAN.CH3 = { deadIdx: w.cells.map((s, i) => (s === 'dead' ? i : -1)).filter((i) => i >= 0) };

START.CH4 = w.snap();
PLAN.CH4 = { freed: null };
w.vacuum();

START.CH5 = w.snap();                // the ruler arrives: 88 needed against 110 allocated
START.CH6 = w.snap();
const CH6_UPDATES = 8;
PLAN.CH6 = { updates: CH6_UPDATES };
for (let i = 0; i < CH6_UPDATES; i++) w.update();

START.CH7 = w.snap();
PLAN.CH7 = { rounds: 5, perRound: 3, tailUpdates: 5 };
/* Every operation the chapter ANIMATES happens here too, in the same order. The simulation
   is the only thing later chapters inherit from, so an op that exists only in the animation
   makes the next chapter open on a world that never existed. */
w.vacuum();                                              // beat 1: the manual sweep
for (let r = 0; r < 5; r++) { for (let i = 0; i < 3; i++) w.update(); w.vacuum(); }
for (let k = 0; k < 5; k++) { w.update(); w.vacuum(); }  // beat 5: the cost, sweeps close together

START.CH8 = w.snap();
const CH8_UPDATES = 11;
PLAN.CH8 = { updates: CH8_UPDATES };
for (let i = 0; i < CH8_UPDATES; i++) w.update();

START.CH9 = w.snap();
PLAN.CH9 = { liveCount: w.live.length };
w.rewrite();

START.CH10 = w.snap();
START.CH11 = w.snap();
/* CH10 steps out to the instrument and drives the world to do it. */
const CH10_UPD = 22;                  // 25% of 88 — past the 20% threshold CH3 established
for (let i = 0; i < CH10_UPD; i++) w.update();
w.vacuum();
PLAN.CH10 = {
  updates: CH10_UPD,
  alloc: w.alloc,
  freeIdx: w.cells.slice(0, w.next).map((s, i) => (s === 'free' ? i : -1)).filter((i) => i >= 0),
};

/* ---------------------------------------------------------------------------
   emit helpers
--------------------------------------------------------------------------- */
const lit = (o) => JSON.stringify(o);
const beats = (ch) => T[ch].beats.map((b) => +b.start.toFixed(2));
const dur = (ch) => T[ch].duration;

/** boot a chapter's world from a snapshot, with no animation */
const boot = (snap, opts = {}) => [
  'const INIT = ' + lit(snap.cells) + ';',
  'const START_ALLOC = ' + snap.alloc + ';',
  'let nextFree = ' + snap.next + ', allocated = START_ALLOC;',
  '/* the live array comes from the simulation, order and all */',
  'let live = ' + lit(snap.live) + ';',
  'INIT.forEach((s, i) => makeCell(i, s));',
  "const alloc = document.getElementById('alloc');",
  'applyFrame(alloc, allocated);',
  opts.keepNeed ? '' : "document.getElementById('need').remove();",
  '/* the same deterministic pick the whole video uses — chapter boundaries never reset it */',
  'let u = ' + (opts.u || 0) + ';',
  'function pickLive() { const p = live[(u * 37 + 13) % live.length]; u += 1; return p; }',
  '/* A BUILD-TIME shadow of the world. cells[] only changes when the timeline PLAYS, so a',
  '   firstFree() that read it while scheduling returned the same slot for every update in',
  '   the loop — eight updates all aimed at one cell, and the chapter ended in a state the',
  '   next chapter had never inherited. */',
  'const st = INIT.slice();',
  'function firstFree() {',
  "  for (let i = 0; i < nextFree; i++) if (st[i] === 'free') return i;",
  '  return nextFree++;',
  '}',
].filter(Boolean).join('\n');

/** schedule one UPDATE at time t, returning the target slot so callers can grow the frame */
const UPDATE_FN = [
  'function doUpdate(t) {',
  '  const pick = pickLive();',
  '  const target = firstFree();',
  "  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
  "  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(target), null, t + 0.08);",
  '  live[live.indexOf(pick)] = target;',
  "  st[pick] = 'dead'; st[target] = 'live';",
  '  if (nextFree > allocated) {',
  '    allocated = Math.ceil(nextFree / COLS) * COLS;',
  '    growFrame(tl, alloc, allocated, t + 0.10, 0.3);',
  '    return allocated;',
  '  }',
  '  return null;',
  '}',
].join('\n');

/** the sweep band: identical wherever autovacuum runs, so only its OUTCOME can differ */
const SWEEP_FN = [
  "const sweepBar = document.createElement('div');",
  "sweepBar.className = 'sweep';",
  "sweepBar.style.cssText = 'left:' + (X0 - 14) + 'px;top:' + (Y0 - 14) + 'px;width:' +",
  "  (COLS * PITCH - GAP + 28) + 'px;height:' + (PITCH * 2) + 'px';",
  'stage.appendChild(sweepBar);',
  'gsap.set(sweepBar, { opacity: 0 });',
  'function sweep(at, span, reclaim) {',
  '  const rows = Math.ceil(nextFree / COLS);',
  /* Only the position is reset. Opacity ramps from whatever the chapter INHERITED, so a
     band already poised from the previous chapter is not snapped away and re-introduced. */
  '  tl.set(sweepBar, { y: 0 }, at);',
  '  tl.to(sweepBar, { opacity: 1, duration: .18 }, at);',
  "  tl.to(sweepBar, { y: rows * PITCH - PITCH, duration: span, ease: 'none' }, at + 0.18);",
  '  tl.to(sweepBar, { opacity: 0, duration: .22 }, at + 0.18 + span);',
  '  if (!reclaim) return;',
  "  for (let i = 0; i < nextFree; i++) if (st[i] === 'dead') st[i] = 'free';",
  '  for (let i = 0; i < nextFree; i++) {',
  '    const row = Math.floor(i / COLS);',
  "    tl.call(((idx) => () => { if (cells[idx] && cells[idx].state === 'dead') setState(idx, 'free'); })(i),",
  '      null, at + 0.3 + (row / rows) * span);',
  '  }',
  '}',
].join('\n');

const WORLD_GEOM = { cols: COLS, cell: 76, x0: 90, y0: 430, live: LIVE_N };

/* ═══════════════════════ CH1 · Quan sát · 10s ════════════════════════════════
   No world yet. Two readings of one table over six months: one flat, one climbing. The
   puzzle has to stand on its own before anything explains it. */
{
  const b = beats('ch01-quan-sat');
  proto({
    id: 'ch01-quan-sat', dur: dur('ch01-quan-sat'), world: WORLD_GEOM,
    note: '   CH1 — the observation. No storage world yet: the viewer is outside the table,\n'
        + '   reading two numbers off it. They disagree, and that disagreement is the whole shot.',
    css: [
      '#tbl { position: absolute; left: 90px; top: 560px; width: 900px; height: 3px;',
      '       background: var(--ink-dim); }',
      '#tlbl { position: absolute; left: 90px; top: 500px; }',
      '.rd { position: absolute; left: 90px; width: 900px; }',
      '#rLbl { top: 700px; } #sLbl { top: 900px; }',
      '.rv { position: absolute; font-family: var(--font-value); font-size: 68px; }',
      '#rV { left: 90px; top: 740px; color: var(--ink); }',
      '#span { position: absolute; left: 90px; top: 1180px; width: 900px; height: 1.5px;',
      '        background: var(--rule); }',
      '#sp1 { position: absolute; left: 90px; top: 1200px; color: var(--ink-dim); }',
      '#sp2 { position: absolute; left: 780px; top: 1200px; width: 210px; color: var(--ink-dim); }',
      '#bar { position: absolute; left: 90px; top: 940px; height: 26px; background: var(--stale);',
      '       transform-origin: left center; }',
    ].join('\n'),
    body: [
      '    <div id="tlbl" class="cap">bảng đơn hàng</div>',
      '    <div id="tbl"></div>',
      '    <div id="rLbl" class="cap rd">số dòng</div>',
      '    <div id="sLbl" class="cap rd">dung lượng</div>',
      '    <div id="bar"></div>',
      '    <div id="span"></div>',
      '    <div id="sp1" class="cap">sáu tháng trước</div>',
      '    <div id="sp2" class="cap">hôm nay</div>',
    ].join('\n'),
    js: [
      "gsap.set(['#tlbl','#tbl','#rLbl','#sLbl','#bar','#span','#sp1','#sp2'], { opacity: 0 });",
      "gsap.set('#bar', { width: 300 });",
      "document.getElementById('need').remove();",
      "document.getElementById('alloc').remove();",
      '',
      '/* beat 1 — the table, and a row count that was the same six months ago */',
      "tl.to(['#tlbl','#tbl'], { opacity: 1, duration: .5, ease: R }, " + (b[0] + 0.2) + ')',
      "  .to('#rLbl', { opacity: 1, duration: .4, ease: R }, " + (b[0] + 0.9) + ')',
      "  .to(['#span','#sp1','#sp2'], { opacity: 1, duration: .5, ease: R }, " + (b[0] + 2.1) + ');',
      "counter(90, 740, '#EDEAE4', ['1 000 000'], [" + (b[0] + 1.2) + ']);',
      '',
      '/* beat 2 — and a size that did not stay the same */',
      "tl.to(['#sLbl','#bar'], { opacity: 1, duration: .45, ease: R }, " + (b[1] + 0.15) + ')',
      "  .to('#bar', { scaleX: 2.6, duration: 1.7, ease: T }, " + (b[1] + 0.5) + ');',
      '',
      '/* beat 3 — the two readings held together. Nothing moves; the contradiction does the work. */',
      "tl.to('#rLbl', { color: '#4E8C7D', duration: .5, ease: 'none' }, " + (b[2] + 0.3) + ')',
      "  .to('#sLbl', { color: '#E0533D', duration: .5, ease: 'none' }, " + (b[2] + 1.1) + ');',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH2 · Cơ chế ghi · 29s ══════════════════════════════
   The world is born and the mechanism runs in it. 29 seconds is longer than the 26 P5
   proved, so the chapter carries a REVEAL rather than a longer loop: the dead counter
   arrives at beat 4, and from then on the viewer can measure what has been accumulating. */
{
  const b = beats('ch02-co-che-ghi');
  const n = PLAN.CH2.updates;
  const first = b[1] + 0.6;                       // updates start when "không sửa tại chỗ" lands
  const last = b[5] + 2.4;
  const step = +((last - first) / (n - 1)).toFixed(3);
  proto({
    id: 'ch02-co-che-ghi', dur: dur('ch02-co-che-ghi'), world: WORLD_GEOM,
    note: '   CH2 — the storage world, and the write mechanism inside it.\n'
        + '   One update every ' + step + 's: slow enough to read one at a time, which is what makes\n'
        + '   "the live count never changes" checkable rather than asserted.',
    css: '#cLive { left: 90px; top: 250px; color: var(--ink); }\n'
       + '#cDead { left: 520px; top: 250px; color: var(--lost); }',
    body: '    <div id="cLive" class="cap">phiên bản sống</div>\n'
        + '    <div id="cDead" class="cap">phiên bản chết</div>',
    js: [
      boot(START.CH2),
      UPDATE_FN,
      "gsap.set(['#alloc','#cLive','#cDead'], { opacity: 0 });",
      '',
      '/* beat 1 — the population is read across the whole beat, in reading order. Every',
      '   cell is already in its final slot and final state and only opacity moves, so this',
      '   is the world being LOOKED AT, not built. Measured before this: 4.25s of the beat',
      '   had no frame-to-frame change at all. */',
      "gsap.set('#world', { opacity: 1 });",
      "gsap.set('.cell', { opacity: 0 });",
      "tl.to('.cell', { opacity: 1, duration: .45, ease: R, stagger: "
        + (((beats('ch02-co-che-ghi')[1] - 0.9) - 0.3) / (LIVE_N - 1)).toFixed(4) + ' }, '
        + (b[0] + 0.3) + ');',
      "tl.to('#alloc', { opacity: 1, duration: .5, ease: R }, " + (b[0] + 1.2) + ');',
      "tl.to('#cLive', { opacity: 1, duration: .4, ease: R }, " + (b[0] + 1.8) + ');',
      "counter(90, 286, '#EDEAE4', [" + LIVE_N + '], [' + (b[0] + 1.9) + ']);',
      '',
      '/* beats 2-6 — the updates. Each kills in place and writes elsewhere. */',
      'const deadV = [], deadT = [];',
      'for (let i = 0; i < ' + n + '; i++) {',
      '  const t = +(' + first + ' + i * ' + step + ').toFixed(3);',
      '  doUpdate(t);',
      '  deadV.push(i + 1); deadT.push(t + 0.14);',
      '}',
      '',
      '/* beat 4 — the reveal: what has been piling up is now countable. The chapter adds a',
      '   new way to see the same world instead of running the same loop for longer. */',
      "tl.to('#cDead', { opacity: 1, duration: .45, ease: R }, " + (b[3] + 0.4) + ');',
      'const cut = deadT.findIndex((t) => t > ' + (b[3] + 0.4) + ');',
      "counter(520, 286, '#6A6F74', deadV.slice(cut), deadT.slice(cut));",
    ].join('\n'),
  });
}

/* ═══════════════════════ CH3 · Ngưỡng · 15s ══════════════════════════════════
   The threshold needs a count, so the analytical register earns its place — and the tuples
   come back to their own slots afterwards, which is what keeps it a change of REPRESENTATION
   rather than a claim about storage. */
{
  const b = beats('ch03-nguong');
  const dead = PLAN.CH3.deadIdx;
  proto({
    id: 'ch03-nguong', dur: dur('ch03-nguong'), world: WORLD_GEOM,
    note: '   CH3 — the threshold. The dead versions are counted in a separate register and then\n'
        + '   returned to the exact slots they came from. A ghost holds each slot while its\n'
        + '   depiction is away, so the world never claims a tuple moved.',
    css: '#cLive { left: 90px; top: 250px; color: var(--ink); }\n'
       + '#cDead { left: 520px; top: 250px; color: var(--lost); }\n'
       + '#thr { position: absolute; left: 90px; top: 1400px; color: var(--counterfactual);\n'
       + '       font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;\n'
       + '       text-transform: uppercase; font-weight: 500; }',
    body: '    <div id="cLive" class="cap">phiên bản sống</div>\n'
        + '    <div id="cDead" class="cap">phiên bản chết</div>\n'
        + '    <div id="analytic"></div>\n'
        + '    <div id="thr">ngưỡng &middot; 20% số dòng của bảng</div>',
    js: [
      boot(START.CH3, { u: PLAN.CH2.updates }),
      SWEEP_FN,
      "gsap.set(['#analytic','#thr'], { opacity: 0 });",
      '',
      '/* beat 1 — autovacuum exists and is NOT running. The band appears at the top of the',
      '   allocation and stays there: a cleaner poised, which is what "không chạy liên tục" is. */',
      "tl.set(sweepBar, { y: 0, scaleY: 4 / (PITCH * 2), transformOrigin: 'left top' }, 0);",
      "tl.to(sweepBar, { opacity: .9, duration: .5, ease: R }, " + (beats('ch03-nguong')[0] + 0.9) + ');',
      "counter(90, 286, '#EDEAE4', [" + LIVE_N + '], [0]);',
      "counter(520, 286, '#6A6F74', [" + dead.length + '], [0]);',
      '',
      '/* beat 2 — the analytical band opens, in its own region of the frame */',
      "tl.to(['#analytic','#thr'], { opacity: 1, duration: .5, ease: R }, " + (b[1] + 0.3) + ');',
      '',
      '/* one travelling copy per dead version; the slot keeps a ghost the whole time */',
      'const DEAD = ' + lit(dead) + ';',
      'const trips = [];',
      'DEAD.forEach((idx, k) => {',
      '  const [sx, sy] = slotXY(idx);',
      "  const d = document.createElement('div');",
      "  d.className = 'cell dead';",
      "  d.style.cssText = 'left:' + sx + 'px;top:' + sy + 'px;width:' + CELL + 'px;height:' + CELL + 'px';",
      '  world.appendChild(d);',
      '  const tx = 90 + (k % 9) * (CELL + 14), ty = 1466 + Math.floor(k / 9) * (CELL + 14);',
      '  trips.push({ el: d, idx: idx });',
      '  const out = ' + (b[1] + 0.7) + ' + k * 0.09;',
      "  tl.call(((i) => () => setState(i, 'ghost'))(idx), null, out);",
      '  tl.to(d, { x: tx - sx, y: ty - sy, duration: .8, ease: T }, out);',
      '});',
      '',
      '/* beat 3 — the count against the threshold, then everything returns */',
      'trips.forEach((tr, k) => {',
      '  const back = ' + (b[2] + 3.1) + ' + k * 0.06;',
      '  tl.to(tr.el, { x: 0, y: 0, duration: .8, ease: T }, back);',
      "  tl.call(((i) => () => setState(i, 'dead'))(tr.idx), null, back + 0.75);",
      '  tl.to(tr.el, { opacity: 0, duration: .1 }, back + 0.8);',
      '});',
      "tl.to(['#analytic','#thr'], { opacity: 0, duration: .5, ease: 'power2.in' }, " + (b[2] + 5.0) + ');',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH4 · Cú lật · 16s ══════════════════════════════════
   Three beats that cannot be compressed. The sweep really does remove the dead versions, it
   does not return the space, and the frame does not move. There is no tween on the
   allocation frame anywhere in this chapter — checked on the rendered artifact. */
{
  const b = beats('ch04-cu-lat');
  proto({
    id: 'ch04-cu-lat', dur: dur('ch04-cu-lat'), world: WORLD_GEOM,
    note: '   CH4 — VACUUM. Dead versions become reusable slots INSIDE the table, and the\n'
        + '   allocated extent does not move. The absence of that movement is the point, and it\n'
        + '   is verified by measurement rather than by watching.',
    css: '#cLive { left: 90px; top: 250px; color: var(--ink); }\n'
       + '#cDead { left: 520px; top: 250px; color: var(--lost); }',
    body: '    <div id="cLive" class="cap">phiên bản sống</div>\n'
        + '    <div id="cDead" class="cap">phiên bản chết</div>',
    js: [
      boot(START.CH4, { u: PLAN.CH2.updates }),
      SWEEP_FN,
      '/* inherited from CH3: the cleaner is already there, parked and not running */',
      "gsap.set(sweepBar, { opacity: .9, y: 0, scaleY: 4 / (PITCH * 2), transformOrigin: 'left top' });",
      "counter(90, 286, '#EDEAE4', [" + LIVE_N + '], [0]);',
      '',
      '/* beat 1-2 — autovacuum takes its turn, and the sweep really does clear */',
      /* the line thickens into a band before it moves — that IS "autovacuum takes its turn" */
      'tl.to(sweepBar, { scaleY: 1, duration: .45, ease: T }, ' + (b[0] + 1.45) + ');',
      'sweep(' + (b[0] + 1.9) + ', 10.4, true);',
      "counter(520, 286, '#6A6F74', [" + PLAN.CH3.deadIdx.length + ', 0], [0, ' + (b[1] + 1.9) + ']);',
      '',
      '/* beats 3-4 — and the extent does not follow. Nothing below animates the frame. */',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH5 · Đọc lại con số · 16s ══════════════════════════
   The ruler arrives late, as an answer to a question the viewer has started asking. A
   quantity belongs on an axis; it is never drawn as a frame around a subset of cells. */
{
  const b = beats('ch05-doc-lai-con-so');
  const snap = START.CH5;
  const UNIT = +(760 / snap.alloc).toFixed(3);
  proto({
    id: 'ch05-doc-lai-con-so', dur: dur('ch05-doc-lai-con-so'), world: WORLD_GEOM,
    note: '   CH5 — the measurement register. Teal never changes length because the live count\n'
        + '   never changes; vermilion is what has been allocated. The gap between their ends is\n'
        + '   bloat — a distance on screen, not a label.',
    css: '#gapLbl { position: absolute; left: 90px; top: 388px; width: 900px; color: var(--stale); }',
    body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
        + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>\n'
        + '    <div id="gapLbl" class="cap">bloat</div>',
    js: [
      boot(snap, { u: PLAN.CH2.updates }),
      "gsap.set(['#axis','#bNeed','#bAlloc','#drop','#gapLbl'], { opacity: 0 });",
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#bAlloc', { width: " + (snap.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      '',
      '/* beat 1 — the reading is not what it seemed */',
      "tl.to('#axis', { opacity: 1, duration: .4, ease: R }, " + (b[0] + 0.3) + ')',
      "  .to('#bAlloc', { opacity: 1, duration: .5, ease: R }, " + (b[0] + 0.7) + ');',
      '',
      '/* beat 2 — what the live data actually needs, held against it */',
      "tl.to('#bNeed', { opacity: 1, duration: .5, ease: R }, " + (b[1] + 0.4) + ')',
      "  .to('#drop', { opacity: 1, duration: .5, ease: R }, " + (b[1] + 1.6) + ');',
      '',
      '/* beat 4 — and the distance between them has a name */',
      "tl.to('#gapLbl', { opacity: 1, duration: .5, ease: R }, " + (b[3] + 1.5) + ');',
      "gsap.set('#gapLbl', { x: " + (LIVE_N * UNIT + 16).toFixed(1) + ' });',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH6 · Ổn định · 8s ══════════════════════════════════ */
{
  const b = beats('ch06-on-dinh');
  const snap = START.CH6;
  const UNIT = +(760 / snap.alloc).toFixed(3);
  proto({
    id: 'ch06-on-dinh', dur: dur('ch06-on-dinh'), world: WORLD_GEOM,
    note: '   CH6 — the later writes land in slots the table already owns, so the extent stops\n'
        + '   moving. It stops growing; it does not shrink.',
    body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
        + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>',
    js: [
      boot(snap, { u: PLAN.CH2.updates }),
      UPDATE_FN,
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#bAlloc', { width: " + (snap.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      '',
      '/* beat 1 — writes land in slots the table already owns: the frame is not pushed. */',
      '/* beat 2 — and they KEEP landing while the sentence says the table stops growing. The',
      '   stillness that matters is the boundary\'s, not the world\'s: if the churn stopped too,',
      '   the shot would only be showing that nothing is happening. */',
      'for (let i = 0; i < ' + PLAN.CH6.updates + '; i++) {',
      '  doUpdate(+(' + (b[0] + 0.5) + ' + i * '
        + (((b[1] + 2.9) - (b[0] + 0.5)) / (PLAN.CH6.updates - 1)).toFixed(3) + ').toFixed(3));',
      '}',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH7 · Cách sửa · 26s ════════════════════════════════
   A lower threshold makes the sweep fire while there is still little to reclaim, so the
   extent stops climbing early. What it cannot do is give back what was already taken — and
   that is shown by the vermilion bar never retreating. */
{
  const b = beats('ch07-cach-sua');
  const snap = START.CH7;
  const UNIT = +(760 / snap.alloc).toFixed(3);
  const R7 = PLAN.CH7;
  proto({
    id: 'ch07-cach-sua', dur: dur('ch07-cach-sua'), world: WORLD_GEOM,
    note: '   CH7 — lowering the reclaim threshold. Sweeps fire often and early, so dead space is\n'
        + '   reused before the table has to ask for more. The counterfactual mark shows where the\n'
        + '   high-water mark would have stopped; the bar itself never retreats, because this fix\n'
        + '   does not recover anything already lost.',
    css: '#cf { position: absolute; top: 310px; width: 2px; height: 34px; background: var(--counterfactual); }\n'
       + '#cfLbl { position: absolute; top: 352px; width: 420px; color: var(--counterfactual); }',
    body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
        + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>\n'
        + '    <div id="cf"></div><div id="cfLbl" class="cap">nếu hạ ngưỡng từ đầu</div>',
    js: [
      boot(snap, { u: PLAN.CH2.updates + PLAN.CH6.updates }),
      UPDATE_FN, SWEEP_FN,
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#bAlloc', { width: " + (snap.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set(['#cf','#cfLbl'], { opacity: 0, x: " + (LIVE_N * UNIT * 1.12).toFixed(1) + ' });',
      '',
      '/* beat 1 — a manual sweep fires, and the extent does not move. That is the answer to',
      '   "run VACUUM by hand more often": it was never the thing holding the mark up. */',
      'sweep(' + (b[0] + 0.5) + ', 1.6, true);',
      '',
      '/* beat 2 — the threshold comes down: a few updates, then a sweep, over and over */',
      'for (let r = 0; r < ' + R7.rounds + '; r++) {',
      '  const base = ' + (b[1] + 0.5) + ' + r * 2.5;',
      '  for (let i = 0; i < ' + R7.perRound + '; i++) doUpdate(base + i * 0.34);',
      '  sweep(base + 1.3, 0.9, true);',
      '}',
      '',
      '/* beat 3 — what does NOT change: versions are still produced, and the bar never retreats */',
      '',
      '/* beat 4 — what is gained: where the mark would have stopped */',
      "tl.to(['#cf','#cfLbl'], { opacity: 1, duration: .5, ease: R }, " + (b[3] + 0.8) + ');',
      '',
      '/* beat 5 — the cost: the same work, arriving far more often. Density is the price. */',
      'for (let k = 0; k < 5; k++) {',
      '  const t = ' + (b[4] + 0.6) + ' + k * 1.05;',
      '  doUpdate(t);',
      '  sweep(t + 0.4, 0.5, true);',
      '}',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH8 · Vacuum vô ích · 13s ═══════════════════════════
   The same world and the same sweep. What differs is a horizon an old snapshot holds, and
   the outcome: nothing clears. The contrast with CH4 is the explanation. */
{
  const b = beats('ch08-vacuum-vo-ich');
  const snap = START.CH8;
  const UNIT = +(760 / snap.alloc).toFixed(3);
  proto({
    id: 'ch08-vacuum-vo-ich', dur: dur('ch08-vacuum-vo-ich'), world: WORLD_GEOM,
    note: '   CH8 — autovacuum runs, reports done, and reclaims nothing. Same sweep animation as\n'
        + '   CH4; the difference lives in the state, not in a label.',
    body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
        + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>\n'
        + '    <div class="horizon" id="hz"></div>',
    js: [
      boot(snap, { u: PLAN.CH2.updates + PLAN.CH6.updates + PLAN.CH7.rounds * PLAN.CH7.perRound + PLAN.CH7.tailUpdates }),
      UPDATE_FN, SWEEP_FN,
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#bAlloc', { width: " + (snap.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#hz', { opacity: 0, y: Y0 - 22 });",
      '',
      '/* beat 2 — an old snapshot holds the visibility horizon */',
      "tl.to('#hz', { opacity: 1, duration: .5, ease: R }, " + (b[0] + 0.5) + ');',
      'for (let i = 0; i < ' + PLAN.CH8.updates + '; i++) doUpdate(' + (b[1] + 1.0) + ' + i * 0.34);',
      '',
      '/* the sweep runs — and clears nothing */',
      'sweep(' + (b[2] + 0.5) + ', 2.2, false);',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH9 · Viết lại · 14s ════════════════════════════════
   Explanatory geometry for a rewrite that needs working room. Not something ordinary VACUUM
   does, not a claim that twice the disk is always required, and not a second table anyone
   can see. The lock is the churn stopping. */
{
  const b = beats('ch09-viet-lai');
  const snap = START.CH9;
  const UNIT = +(760 / snap.alloc).toFixed(3);
  const L = PLAN.CH9.liveCount;
  proto({
    id: 'ch09-viet-lai', dur: dur('ch09-viet-lai'), world: WORLD_GEOM,
    note: '   CH9 — the rewrite. A second container has to exist at the same time as the first;\n'
        + '   that coexistence is the extra disk. Nothing in the old world changes while it is\n'
        + '   being read, and that stillness is the lock.',
    body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
        + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>\n'
        + '    <div id="copy" class="frame"></div><div id="copyWorld"></div>',
    js: [
      boot(snap, { u: 0 }),
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#bAlloc', { width: " + (snap.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      '',
      "const copy = document.getElementById('copy');",
      'applyFrame(copy, ' + L + ');',
      "gsap.set(copy, { y: 900, opacity: 0 });",
      '',
      '/* beat 1 — a second container appears, and the old one dims because it is being READ */',
      "tl.to(copy, { opacity: 1, duration: .5, ease: R }, " + (b[0] + 1.2) + ')',
      "  .to(['#world','#alloc'], { opacity: .38, duration: .6, ease: T }, " + (b[0] + 1.4) + ');',
      '',
      'const copyCells = [];',
      'for (let k = 0; k < ' + L + '; k++) {',
      '  const [x, y] = slotXY(k);',
      "  const d = document.createElement('div');",
      "  d.className = 'cell live';",
      "  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + CELL + 'px;height:' + CELL + 'px;opacity:0';",
      "  document.getElementById('copyWorld').appendChild(d);",
      '  gsap.set(d, { y: 900 });',
      '  copyCells.push(d);',
      '  tl.to(d, { opacity: 1, duration: .1, ease: R }, ' + (b[0] + 2.1) + ' + k * 0.045);',
      '}',
      '',
      '/* beat 3 — the old container goes, and only then is the extent smaller */',
      "tl.to(['#world','#alloc'], { opacity: 0, duration: .5, ease: 'power2.in' }, " + (b[2] + 0.2) + ');',
      "tl.to('#copyWorld', { y: -900, duration: .9, ease: T }, " + (b[2] + 0.8) + ');',
      "tl.to(copy, { y: 0, duration: .9, ease: T }, " + (b[2] + 0.8) + ');',
      "tl.to('#bAlloc', { scaleX: " + (L / snap.alloc).toFixed(3) + ", duration: .9, ease: T }, " + (b[2] + 0.8) + ');',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH10 · Công cụ đo · 22s ═════════════════════════════
   The one chapter that steps out of the story to the instrument — and it steps out by
   READING the world, not by describing it.

   The first build was four stacked sentences beside an inert thumbnail, and the thumbnail
   was the wrong witness: it showed a packed table with zero dead versions sitting next to
   the claim "zero dead does not prove no bloat", which is the one state that claim is not
   about. The narration itself names the two devices that do carry it — "mốc nước vẫn nằm
   nguyên đó" is the allocation frame, and "bloat là chênh lệch, không phải kích thước" is
   the ruler. Both are already established, so nothing new is introduced: the frame is held
   motionless from beat 3 to the end while the interior takes three different meanings under
   it. The reading returns to zero and the extent does not follow; then the difference closes
   without the extent moving at all. */
{
  const b = beats('ch10-cong-cu-do');
  const snap = START.CH10;
  const R10 = PLAN.CH10;
  const CELL10 = 60, X10 = 210, Y10 = 600;
  const UNIT = +(760 / R10.alloc).toFixed(3);
  const stale = +(b[1] + 2.0).toFixed(2);
  const swept = +(b[2] + 0.46).toFixed(2);
  const fill = +(b[3] + 2.44).toFixed(2);
  const step10 = +(((b[2] - 0.6) - (b[1] + 0.2)) / (R10.updates - 1)).toFixed(4);
  proto({
    id: 'ch10-cong-cu-do', dur: dur('ch10-cong-cu-do'),
    world: { ...WORLD_GEOM, cell: CELL10, x0: X10, y0: Y10 },
    note: '   CH10 — the instrument. Two column names, two readings taken from the world, and\n'
        + '   every "does not prove" shown as a state of that world instead of asserted. The\n'
        + '   allocation frame does not move once from beat 3 onward — measured, not watched.',
    css: [
      '#q { position: absolute; left: 90px; top: 250px; width: 900px; }',
      '.col { position: absolute; left: 90px; font-family: var(--font-value); font-size: 34px;',
      '       color: var(--ink); }',
      '#c1 { top: 320px; } #c2 { top: 376px; }',
      '#rule1 { position: absolute; left: 90px; top: 450px; width: 900px; height: 1.5px;',
      '         background: var(--rule); }',
      '#d1 { position: absolute; left: 90px; top: 496px; width: 900px; color: var(--stale);',
      '      font-family: var(--font-label); font-size: 32px; letter-spacing: .01em;',
      '      font-weight: 600; }',
      '#hw { position: absolute; left: 560px; top: ' + (Y10 + 10 * CELL10 + 44) + 'px;',
      '      width: 324px; text-align: right; color: var(--counterfactual); }',
      '#axis { top: 1340px; } #bNeed { top: 1286px; } #bAlloc { top: 1356px; }',
      '#drop { top: 1286px; }',
      '#gapLbl { position: absolute; left: 90px; top: 1420px; width: 900px; color: var(--stale); }',
    ].join('\n'),
    body: [
      '    <div id="q" class="cap">pg_stat_user_tables</div>',
      '    <div class="col" id="c1">n_dead_tup</div>',
      '    <div class="col" id="c2">last_autovacuum</div>',
      '    <div id="rule1"></div>',
      '    <div id="d1">thu hồi không theo kịp, hoặc đang bị chặn</div>',
      '    <div id="hw" class="cap">mốc nước</div>',
      '    <div id="axis"></div><div class="bar" id="bNeed"></div>',
      '    <div class="bar" id="bAlloc"></div><div id="drop"></div>',
      '    <div id="gapLbl" class="cap">chênh lệch</div>',
    ].join('\n'),
    js: [
      boot(snap, { u: PLAN.CH2.updates + PLAN.CH6.updates
                     + PLAN.CH7.rounds * PLAN.CH7.perRound + PLAN.CH7.tailUpdates
                     + PLAN.CH8.updates }),
      UPDATE_FN,
      SWEEP_FN,
      "gsap.set(['#q','#c1','#c2','#rule1','#d1','#hw','#world','#alloc'], { opacity: 0 });",
      "gsap.set(['#axis','#bNeed','#bAlloc','#drop','#gapLbl'], { opacity: 0 });",
      '',
      '/* beat 1 — the two columns, and the world the readings are taken FROM */',
      "tl.to('#q', { opacity: 1, duration: .45, ease: R }, " + (b[0] + 0.4) + ');',
      "tl.to(['#world','#alloc'], { opacity: 1, duration: .6, ease: R }, " + (b[0] + 0.9) + ');',
      "tl.to('#c1', { opacity: 1, duration: .45, ease: R }, " + (b[0] + 1.6) + ');',
      "tl.to('#c2', { opacity: 1, duration: .45, ease: R }, " + (b[0] + 3.4) + ');',
      '',
      '/* beat 2 — the pattern is dead versions piling up WHILE nothing arrives to reclaim',
      '   them. 25% of the live count, past the 20% threshold CH3 established, and the',
      '   cleaner never comes. last_autovacuum is not a fabricated timestamp: it reports the',
      '   relation the viewer can watch — a sweep has just run, or has not run for a while. */',
      'const deadV = [0], deadT = [' + (b[0] + 1.7) + '];',
      'for (let i = 0; i < ' + R10.updates + '; i++) {',
      '  const t = +(' + (b[1] + 0.2) + ' + i * ' + step10 + ').toFixed(3);',
      '  doUpdate(t);',
      '  deadV.push(i + 1); deadT.push(+(t + 0.14).toFixed(3));',
      '}',
      '/* both readings are ONE sequence each — the reading has one slot, not two */',
      'deadV.push(0); deadT.push(' + swept + ');',
      "counter(560, 314, '#6A6F74', deadV, deadT);",
      "counter(560, 370, ['#EDEAE4','#E0533D','#EDEAE4'], ['vừa xong','đã lâu','vừa xong'], ["
        + [b[0] + 3.5, stale, +(b[2] + 3.3).toFixed(2)].join(', ') + ']);',
      "tl.to(['#rule1','#d1'], { opacity: 1, duration: .45, ease: R }, " + (b[1] + 3.5) + ');',
      '',
      '/* beat 3 — the sweep runs, the reading goes back to zero, and the extent does not',
      '   follow. Nothing below this animates the frame; that absence is the claim. */',
      'sweep(' + (b[2] + 0.3) + ', 2.6, true);',
      "tl.to('#d1', { opacity: .28, duration: .5, ease: T }, " + (b[2] + 3.3) + ');',
      "tl.to('#hw', { opacity: 1, duration: .5, ease: R }, " + (b[2] + 3.9) + ');',
      '',
      '/* beat 4 — size is not the measure. The frame is FIXED and the interior fills with',
      '   real rows: the same extent, and the difference gone. */',
      "gsap.set('#bNeed', { width: " + (LIVE_N * UNIT).toFixed(1) + ', scaleX: 1 });',
      "gsap.set('#bAlloc', { width: " + (R10.alloc * UNIT).toFixed(1) + ' });',
      "gsap.set('#drop', { x: " + (LIVE_N * UNIT).toFixed(1) + ' });',
      "gsap.set('#gapLbl', { x: " + (LIVE_N * UNIT + 16).toFixed(1) + ' });',
      "tl.to(['#axis','#bAlloc'], { opacity: 1, duration: .45, ease: R }, " + (b[3] + 0.4) + ');',
      "tl.to(['#bNeed','#drop'], { opacity: 1, duration: .45, ease: R }, " + (b[3] + 1.0) + ');',
      "tl.to('#gapLbl', { opacity: 1, duration: .45, ease: R }, " + (b[3] + 1.5) + ');',
      'const FREE = ' + lit(R10.freeIdx) + ';',
      'FREE.forEach((idx, k) => {',
      '  tl.call(((i) => () => setState(i, \'live\'))(idx), null, +(' + fill + ' + k * 0.055).toFixed(3));',
      '});',
      "tl.to('#bNeed', { scaleX: " + (R10.alloc / LIVE_N).toFixed(4) + ', duration: '
        + (R10.freeIdx.length * 0.055 + 0.2).toFixed(2) + ", ease: 'none' }, " + fill + ');',
      "tl.to(['#drop','#gapLbl'], { opacity: 0, duration: .5, ease: T }, "
        + (fill + R10.freeIdx.length * 0.055).toFixed(2) + ');',
    ].join('\n'),
  });
}

/* ═══════════════════════ CH11 · Câu hỏi · 6.5s ═══════════════════════════════ */
{
  const b = beats('ch11-cau-hoi');
  proto({
    id: 'ch11-cau-hoi', dur: dur('ch11-cau-hoi'), world: WORLD_GEOM,
    note: '   CH11 — the question, with the field above it left open. Nothing precedes a question.',
    css: '.q { position: absolute; left: 90px; width: 900px; font-family: var(--font-label);\n'
       + '     font-size: 50px; line-height: 1.22; letter-spacing: .01em; font-weight: 600; }\n'
       + '#q1 { top: 1120px; color: var(--ink); }\n'
       + '#q2 { top: 1196px; color: var(--stale); }',
    body: '    <div class="q" id="q1">bảng nào trong database của bạn</div>\n'
        + '    <div class="q" id="q2">có số dòng đứng yên mà dung lượng vẫn tăng?</div>',
    js: [
      "document.getElementById('need').remove();",
      "document.getElementById('alloc').remove();",
      "gsap.set(['#q1','#q2'], { opacity: 0 });",
      "tl.to('#q1', { opacity: 1, duration: .5, ease: R }, " + (b[0] + 0.3) + ')',
      "  .to('#q2', { opacity: 1, duration: .5, ease: R }, " + (b[0] + 1.5) + ');',
    ].join('\n'),
  });
}

console.log('\nG01: 11 chương');
console.log('thế giới: ' + LIVE_N + ' sống · ngưỡng ' + PLAN.CH3.deadIdx.length
  + ' chết (' + (PLAN.CH3.deadIdx.length / LIVE_N * 100).toFixed(0) + '%) · cấp phát đạt '
  + START.CH5.alloc + ' rồi về ' + PLAN.CH9.liveCount + ' sau khi viết lại');
