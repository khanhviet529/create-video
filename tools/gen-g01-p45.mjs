/**
 * G01 Step 4.5 — the five high-risk prototypes.
 *
 * World and contract come from tools/g01-world.mjs, so nothing here can quietly redefine a
 * colour or a geometry that another chapter depends on.
 */
import { makeProto } from './g01-world.mjs';

const proto = makeProto('D:/creative-video/videos/G01-bloat-not-row-count/shots');

/* ══════════ P1 — physical → analytical → physical, the round trip ═════════════
   The risk: an aggregation that never comes back is indistinguishable from "PostgreSQL moved
   the dead tuples into a pile". The RETURN is the whole proof.

   Device: the tuple never leaves its slot. What travels is a COPY of its depiction, and the
   slot keeps a ghost outline the entire time. Nothing about the relation changes; only where
   one fact about it is being drawn. */
proto({
  id: 'p1-roundtrip', dur: 22,
  world: { live: 45, y0: 430 },
  note: '   P1 — the highest-risk transition, prototyped as a complete round trip.\n'
      + '   A ghost stays in every slot whose depiction has been lifted out, so the world never\n'
      + '   claims the tuple went anywhere.',
  css: [
    '#thr { position: absolute; left: 90px; top: 1290px; color: var(--counterfactual);',
    '       font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;',
    '       text-transform: uppercase; font-weight: 500; }',
  ].join('\n'),
  body: '    <div id="analytic"></div>\n    <div id="thr">ngưỡng &middot; 20% số dòng</div>',
  js: [
    "let live = [];",
    "for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }",
    "let allocated = LIVE_N, nextFree = LIVE_N;",
    "const alloc = document.getElementById('alloc');",
    "applyFrame(alloc, allocated);",
    "document.getElementById('need').remove();",
    "gsap.set(['#analytic', '#thr'], { opacity: 0 });",
    "",
    "const DEAD_N = 9;                    // 20% of 45",
    "const deadIdx = [];",
    "for (let u = 0; u < DEAD_N; u++) {",
    "  const t = 0.6 + u * 0.5;",
    "  const pick = live[(u * 37 + 13) % live.length];",
    "  deadIdx.push(pick);",
    "  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
    "  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.06);",
    "  live[live.indexOf(pick)] = nextFree; nextFree += 1;",
    "  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.08, 0.25); }",
    "}",
    "",
    "/* the analytical band opens — a different register, with its own rule */",
    "tl.to(['#analytic', '#thr'], { opacity: 1, duration: .5, ease: R }, 5.8);",
    "",
    "/* one travelling COPY per dead version; the slot keeps a ghost while its copy is away */",
    "const trips = [];",
    "deadIdx.forEach((idx, k) => {",
    "  const [sx, sy] = slotXY(idx);",
    "  const d = document.createElement('div');",
    "  d.className = 'cell dead';",
    "  d.style.cssText = 'left:' + sx + 'px;top:' + sy + 'px;width:' + CELL + 'px;height:' + CELL + 'px';",
    "  world.appendChild(d);",
    "  const tx = 90 + k * (CELL + 18), ty = 1424;",
    "  trips.push({ el: d, idx: idx });",
    "  const out = 6.3 + k * 0.12;",
    "  tl.call(((i) => () => setState(i, 'ghost'))(idx), null, out);",
    "  tl.to(d, { x: tx - sx, y: ty - sy, duration: .85, ease: T }, out);",
    "});",
    "counter(90, 1540, '#7A8086', [DEAD_N], [8.4]);",
    "",
    "/* and back — to the exact slot each one came from. The return is what makes the",
    "   excursion a change of REPRESENTATION rather than a claim about storage. */",
    "trips.forEach((tr, k) => {",
    "  const back = 13.4 + k * 0.12;",
    "  tl.to(tr.el, { x: 0, y: 0, duration: .85, ease: T }, back);",
    "  tl.call(((i) => () => setState(i, 'dead'))(tr.idx), null, back + 0.8);",
    "  tl.to(tr.el, { opacity: 0, duration: .12 }, back + 0.86);",
    "});",
    "tl.to(['#analytic', '#thr'], { opacity: 0, duration: .5, ease: 'power2.in' }, 15.8);",
  ].join('\n'),
});

/* ══════════ P2 — no sweep vs a sweep that reclaims nothing ═══════════════════
   Three phases in ONE continuous world, because the comparison IS the content:
     phase 1  threshold not reached  -> no sweep event at all
     phase 2  threshold reached      -> sweep runs, dead versions become reusable
     phase 3  an old snapshot exists -> the SAME sweep runs and clears nothing
   Phases 2 and 3 use the identical sweep animation. Only the world's state differs, and that
   is the only thing allowed to carry the difference. */
proto({
  id: 'p2-threshold-vs-snapshot', dur: 30,
  world: { live: 44, y0: 430 },
  note: '   P2 — two different reasons dead versions are still there, in one continuous world.\n'
      + '   No labels: the distinction is whether a sweep EVENT happens, and what it achieves.',
  body: '    <div class="horizon" id="hz"></div>',
  js: [
    "let live = [];",
    "for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }",
    "let allocated = LIVE_N, nextFree = LIVE_N;",
    "const alloc = document.getElementById('alloc');",
    "applyFrame(alloc, allocated);",
    "document.getElementById('need').remove();",
    "gsap.set('#hz', { opacity: 0, y: Y0 + PITCH * 3 - 20 });",
    "",
    "const sweepBar = document.createElement('div');",
    "sweepBar.className = 'sweep';",
    "sweepBar.style.cssText = 'left:' + (X0 - 14) + 'px;top:' + (Y0 - 14) + 'px;width:' +",
    "  (COLS * PITCH - GAP + 28) + 'px;height:' + (PITCH * 2) + 'px';",
    "stage.appendChild(sweepBar);",
    "gsap.set(sweepBar, { opacity: 0 });",
    "",
    "function churn(from, n, step) {",
    "  for (let u = 0; u < n; u++) {",
    "    const t = from + u * step;",
    "    const pick = live[(u * 37 + 13) % live.length];",
    "    tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
    "    tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.05);",
    "    live[live.indexOf(pick)] = nextFree; nextFree += 1;",
    "    if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.06, 0.22); }",
    "  }",
    "}",
    "/** the sweep event. Identical animation in both phases — only the outcome differs. */",
    "function sweep(at, reclaim, belowRow) {",
    "  const rows = rowsFor(nextFree);",
    "  tl.set(sweepBar, { y: 0, opacity: 0 }, at);",
    "  tl.to(sweepBar, { opacity: 1, duration: .2 }, at);",
    "  tl.to(sweepBar, { y: rows * PITCH - PITCH, duration: 1.6, ease: 'none' }, at + 0.2);",
    "  tl.to(sweepBar, { opacity: 0, duration: .25 }, at + 1.8);",
    "  if (!reclaim) return;",
    "  for (let i = 0; i < nextFree; i++) {",
    "    const row = Math.floor(i / COLS);",
    "    if (belowRow !== undefined && row >= belowRow) continue;",
    "    tl.call(((idx) => () => { if (cells[idx] && cells[idx].state === 'dead') setState(idx, 'free'); })(i),",
    "      null, at + 0.35 + (row / rows) * 1.5);",
    "  }",
    "}",
    "",
    "/* PHASE 1 — dead accumulate and NOTHING sweeps. The delay is the absence of an event. */",
    "churn(0.6, 8, 0.55);",
    "",
    "/* PHASE 2 — the threshold is reached: the sweep runs and reclaims */",
    "churn(6.0, 5, 0.5);",
    "sweep(9.2, true);",
    "",
    "/* PHASE 3 — an old snapshot holds the horizon. Same sweep. Nothing clears. */",
    "tl.to('#hz', { opacity: 1, duration: .5, ease: R }, 13.4);",
    "churn(14.4, 10, 0.5);",
    "sweep(20.6, false);",
  ].join('\n'),
});

/* ══════════ P3 — static + ruler  vs  a pull-back ═════════════════════════════ */
const p3 = (pull) => [
  "const UNIT = 10.4;",
  "let live = [];",
  "for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }",
  "let allocated = LIVE_N, nextFree = LIVE_N;",
  "const alloc = document.getElementById('alloc');",
  "applyFrame(alloc, allocated);",
  "document.getElementById('need').remove();",
  "gsap.set('#bNeed', { width: LIVE_N * UNIT });",
  "gsap.set('#bAlloc', { width: LIVE_N * UNIT });",
  "gsap.set('#drop', { x: LIVE_N * UNIT });",
  "",
  "for (let u = 0; u < 30; u++) {",
  "  const t = 0.5 + u * 0.24;",
  "  const pick = live[(u * 37 + 13) % live.length];",
  "  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
  "  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.05);",
  "  live[live.indexOf(pick)] = nextFree; nextFree += 1;",
  "  if (nextFree > allocated) {",
  "    allocated = rowsFor(nextFree) * COLS;",
  "    growFrame(tl, alloc, allocated, t + 0.06, 0.22);",
  "    tl.to('#bAlloc', { scaleX: allocated / LIVE_N, duration: .22, ease: T }, t + 0.06);",
  "  }",
  "}",
].concat(pull ? [
  "",
  "/* the candidate under test: pull back so the whole extent is in view at once */",
  "tl.to(['#world', '#alloc'], { scale: 0.62, transformOrigin: '540px 470px', duration: 1.4, ease: T }, 8.4);",
] : []).join('\n');

proto({
  id: 'p3a-static-ruler', dur: 12, world: { live: 44, y0: 470 },
  note: '   P3 A — static camera. The ruler carries scale.',
  body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
      + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>',
  js: p3(false),
});
proto({
  id: 'p3b-pullback', dur: 12, world: { live: 44, y0: 470 },
  note: '   P3 B — the same run plus a pull-back. Kept only if it reveals something A cannot.',
  body: '    <div id="axis"></div><div class="bar" id="bNeed"></div>\n'
      + '    <div class="bar" id="bAlloc"></div><div id="drop"></div>',
  js: p3(true),
});

/* ══════════ P4 — the rewrite, and the stillness that is the lock ═════════════
   Explanatory geometry for a rewrite that needs working space. NOT a claim that 2x disk is
   always required, not something ordinary VACUUM does, and not a second user-visible table.
   What makes it read as a lock is that the churn — visibly regular up to that point — stops
   dead for the whole copy and resumes only when the rewrite is over. */
proto({
  id: 'p4-rewrite-lock', dur: 20,
  world: { live: 40, y0: 300 },
  note: '   P4 — rewrite into a second container, with the churn metronome stopping.',
  body: ['    <div id="copy" class="frame"></div>', '    <div id="copyWorld"></div>'].join(String.fromCharCode(10)),
  js: [
    "let live = [];",
    "for (let i = 0; i < 77; i++) { makeCell(i, i % 5 < 2 ? 'dead' : 'live'); if (i % 5 >= 2) live.push(i); }",
    "let allocated = 77, nextFree = 77;",
    "const alloc = document.getElementById('alloc');",
    "applyFrame(alloc, allocated);",
    "document.getElementById('need').remove();",
    "",
    "/* the metronome: one update every 0.45s, regular enough that its absence is noticeable */",
    "for (let u = 0; u < 11; u++) {",
    "  const t = 0.4 + u * 0.45;",
    "  const pick = live[(u * 37 + 13) % live.length];",
    "  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
    "  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.05);",
    "  live[live.indexOf(pick)] = nextFree; nextFree += 1;",
    "  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.06, 0.22); }",
    "}",
    "",
    "/* ---- from 5.4s to 15.4s NOTHING in the old world changes. That is the lock. ---- */",
    "const copy = document.getElementById('copy');",
    "const liveNow = live.slice();",
    "applyFrame(copy, liveNow.length);",
    "gsap.set(copy, { y: 820, opacity: 0 });",
    "/* the old container dims while it is being READ, so the two plainly read as two */",
    "tl.to(['#world', '#alloc'], { opacity: .38, duration: .6, ease: T }, 5.8);",
    "tl.to(copy, { opacity: 1, duration: .5, ease: R }, 6.2);",
    "",
    "const copyCells = [];",
    "liveNow.forEach((src, k) => {",
    "  const [x, y] = slotXY(k);",
    "  const d = document.createElement('div');",
    "  d.className = 'cell live';",
    "  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + CELL + 'px;height:' + CELL + 'px;opacity:0';",
    "  document.getElementById('copyWorld').appendChild(d);",
    "  gsap.set(d, { y: 820 });",
    "  copyCells.push(d);",
    "  tl.to(d, { opacity: 1, duration: .14, ease: R }, 7.0 + k * 0.055);",
    "});",
    "",
    "/* fade the CONTAINER, not a list of cells captured at build time: slots created",
    "   during playback are not in any such list, and one row of them survived the first cut. */",
    "tl.to(['#world', '#alloc'], { opacity: 0, duration: .5, ease: 'power2.in' }, 13.6);",
    "tl.to('#alloc', { opacity: 0, duration: .5, ease: 'power2.in' }, 13.8);",
    "/* the cells carry y:820 individually, the frame carries it once — so the container",
    "   goes to -820 and the frame goes to 0. Moving both by the same delta put the frame",
    "   820px above its cells. */",
    "tl.to('#copyWorld', { y: -820, duration: 1.0, ease: T }, 14.6);",
    "tl.to(copy, { y: 0, duration: 1.0, ease: T }, 14.6);",
    "",
    "/* churn resumes only after the rewrite is over — the lock is released */",
    "for (let u = 0; u < 6; u++) {",
    "  const t = 16.4 + u * 0.45;",
    "  tl.call(((i) => () => { copyCells[i].className = 'cell dead'; })((u * 7) % copyCells.length), null, t);",
    "}",
  ].join('\n'),
});

/* ══════════ P5 — CH2 at full provisional length ══════════════════════════════ */
proto({
  id: 'p5-ch2-26s', dur: 26,
  world: { live: 44, y0: 430 },
  note: '   P5 — can the storage world carry 26 seconds of churn without becoming a screensaver?\n'
      + '   One number only, no labels. The standing MVCC condition is carried by the fact that\n'
      + '   nothing ever cleans up — a property shown by duration rather than by a symbol.',
  css: '#cLive { left: 90px; top: 250px; color: var(--ink); }',
  body: '    <div id="cLive" class="cap">phiên bản sống</div>',
  js: [
    "let live = [];",
    "for (let i = 0; i < LIVE_N; i++) { makeCell(i, 'live'); live.push(i); }",
    "let allocated = LIVE_N, nextFree = LIVE_N;",
    "const alloc = document.getElementById('alloc');",
    "applyFrame(alloc, allocated);",
    "document.getElementById('need').remove();",
    "gsap.set(['#world', '#alloc', '#cLive'], { opacity: 0 });",
    "",
    "tl.to('#world', { opacity: 1, duration: .7, ease: R }, 0.4)",
    "  .to('#alloc', { opacity: 1, duration: .5, ease: R }, 1.2)",
    "  .to('#cLive', { opacity: 1, duration: .4, ease: R }, 1.8);",
    "counter(90, 286, '#EDEAE4', [LIVE_N], [1.9]);",
    "",
    "/* 40 updates over 22s — a pace a viewer can follow one at a time */",
    "for (let u = 0; u < 40; u++) {",
    "  const t = 3.0 + u * 0.55;",
    "  const pick = live[(u * 37 + 13) % live.length];",
    "  tl.call(((i) => () => setState(i, 'dead'))(pick), null, t);",
    "  tl.call(((i) => () => { if (!cells[i]) makeCell(i, 'live'); else setState(i, 'live'); })(nextFree), null, t + 0.09);",
    "  live[live.indexOf(pick)] = nextFree; nextFree += 1;",
    "  if (nextFree > allocated) { allocated = rowsFor(nextFree) * COLS; growFrame(tl, alloc, allocated, t + 0.11, 0.3); }",
    "}",
  ].join('\n'),
});

console.log('P1..P5 done');
