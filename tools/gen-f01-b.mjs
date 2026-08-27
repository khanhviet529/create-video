/**
 * F01 Step 5 — group B: accumulation (s02-guess, s12), counting (s06, s14-signal),
 * naming (s07), transformation (s10), hold (s15).
 *
 * Tween times come from voice/shot_timing.json — measured narration beats, not estimates.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/creative-video/videos/F01-object-level-authz/shots';
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
.mono { position: absolute; font-family: var(--font-value); line-height: 1; white-space: pre; }
.sans { position: absolute; font-family: var(--font-label); letter-spacing: 0.01em; font-weight: 600; }`;

function shot({ id, dur, note, css, body, js }) {
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
${body}
  </div>
</div>

<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
const R = 'power3.out', T = 'power2.inOut';
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

/* ══════════════════════ s02-guess · accumulation · 16.5s ══════════════════
   beat 1 (0.00–3.47)   the guess: "chắc phiên đăng nhập cũ chưa hết hạn"
   beat 2 (3.47–8.41)   "nhưng token đó hết hạn từ lâu…"
   beat 3 (8.41–11.07)  "trong database, membership của họ đã bị xoá thật"
   beat 4 (11.07–15.35) "gọi thẳng vào endpoint tài liệu, server trả về 403. đúng như mong đợi."

   The belief STANDS in the upper-left and never moves. Evidence enters the field it does
   not occupy — right, then lower-left, then lower-right — so the frame's weight migrates
   away from the belief as facts pile up against it. Nothing is struck here: this shot only
   accumulates, and the killing is the next shot's job.

   The three evidence items sit at the exact coordinates s02-eliminate opens on, so the eye
   tracks them across the cut.                                                              */
shot({
  id: 's02-guess', dur: 16.5,
  note: `   s02-guess — A BELIEF, AND THE FACTS THAT ARRIVE AGAINST IT. accumulation.
   The known thing holds its position; the new group enters a region it never occupied. The
   guess dims as the evidence accumulates, but is never struck — being contradicted is not
   the same as being eliminated, and the elimination is a separate shot.`,
  css: `#guessLbl { position: absolute; left: 93px; top: 300px; }
#guess { left: 93px; top: 348px; width: 700px; font-size: 46px; color: var(--ink); }
.ev    { font-size: 30px; color: var(--ink-mid); }
.ev em { font-style: normal; color: var(--boundary); font-weight: 600; }
#expect{ position: absolute; left: 600px; top: 908px; width: 420px; color: var(--boundary); }`,
  body: `    <div id="guessLbl" class="label">phản xạ đầu tiên</div>
    <div class="sans" id="guess">chắc phiên đăng nhập cũ chưa hết hạn</div>

    <div class="mono ev" id="e1" style="left:520px;top:430px">token đó hết hạn từ lâu</div>
    <div class="mono ev" id="e2" style="left:180px;top:640px">membership đã bị xoá thật</div>
    <div class="mono ev" id="e3" style="left:600px;top:860px">GET /documents/d41 &rarr; <em id="ev-olddeny">403</em></div>
    <div id="expect" class="label">đúng như mong đợi</div>`,
  js: `gsap.set(['#guessLbl','#guess','#e1','#e2','#e3','#expect'], { opacity: 0 });
tl.to('#guessLbl', { opacity: 1, duration: .35, ease: R }, 0.30)
  .to('#guess', { opacity: 1, duration: .5, ease: R }, 0.90);
/* each fact lands in a region the belief does not hold, and the belief dims a step */
tl.to('#e1', { opacity: 1, duration: .4, ease: R }, 3.70)
  .to('#guess', { color: '#9AA0A6', duration: .5, ease: 'none' }, 4.20)
  .to('#e2', { opacity: 1, duration: .4, ease: R }, 8.60)
  .to('#e3', { opacity: 1, duration: .4, ease: R }, 11.30)
  .to('#guess', { color: '#6A6F74', duration: .6, ease: 'none' }, 11.60)
  .to('#expect', { opacity: 1, duration: .4, ease: R }, 13.60);`,
});

/* ══════════════════════ s06-cadence · counting · 20.5s ════════════════════
   beat 1 (0.00–1.92)   "hai câu hỏi ở đây không cùng nhịp."
   beat 2 (1.92–6.78)   "câu 'anh là ai' được hỏi một lần cho mỗi request…"
   beat 3 (6.78–11.97)  "câu 'anh được chạm vào object này không' thì khác…"
   beat 4 (11.97–19.13) "số đường thì tăng theo thời gian… số lần bạn nhớ hỏi lại thì không."

   COUNTING, but over ONE universe — the two columns are two facts about the SAME paths, so
   they share rows on purpose. The disjoint-region rule belongs to s14, where the universes
   really are disjoint. What carries the meaning here is the asymmetry of fill: one band
   fills completely, the other holds a single cell, and each band's count sits at ITS OWN
   foot rather than in a left-hand stack.

   H2 resolved: the two columns coexist and nothing is ever removed, so no substitution
   reading is available. Verified in p5-h2-motion.                                          */
shot({
  id: 's06-cadence', dur: 20.5,
  note: `   s06 — DELIVERED vs PERFORMED. counting over one universe.
   Identity arrives on every path without anyone doing anything and is never touched again
   by any tween. Authorization coverage arrives BESIDE it, in its own column, on one path.
   Nothing crossfades and nothing shares a position, so req.principal cannot be read as
   turning into assertMember.`,
  css: `#lblTop { position: absolute; left: 93px; top: 244px; width: 894px; }
#hdrId { position: absolute; left: 500px; top: 336px; color: var(--boundary); }
#hdrAz { position: absolute; left: 800px; top: 336px; color: var(--authoritative); }
.p  { left: 93px;  font-size: 34px; color: var(--ink-mid); }
.id { left: 500px; font-size: 34px; color: var(--boundary); }
.az { left: 800px; font-size: 34px; color: var(--authoritative); font-weight: 600; }
.cnt  { position: absolute; font-family: var(--font-value); font-size: 42px; font-weight: 600; }
.cntL { position: absolute; }
#n1 { left: 500px; top: 880px; color: var(--boundary); }
#n2 { left: 800px; top: 880px; color: var(--authoritative); }
#n1L{ left: 500px; top: 934px; color: var(--boundary); }
#n2L{ left: 800px; top: 934px; color: var(--authoritative); }
.close { left: 93px; width: 894px; font-size: 44px; }
#c1 { top: 1060px; color: var(--ink); }
#c2 { top: 1122px; color: var(--stale); }`,
  body: `    <div id="lblTop" class="label">đường http tới cùng tài liệu</div>
    <div id="hdrId" class="label">danh tính</div>
    <div id="hdrAz" class="label">phân quyền</div>
    <div id="rows"></div>

    <div class="cnt" id="n1">5 / 5</div><div class="cntL label" id="n1L">đường</div>
    <div class="cnt" id="n2">1 / 5</div><div class="cntL label" id="n2L">đường</div>

    <div class="sans close" id="c1">số đường tăng theo thời gian</div>
    <div class="sans close" id="c2">số lần nhớ hỏi lại thì không</div>`,
  js: `const PATHS = ['/docs/:id', '/docs/:id/comments', '/docs/:id/history',
               '/docs/:id/exports', '/docs/:id/print'];
const TOP = 420, PITCH = 80;
const host = document.getElementById('rows');
const pathEls = [], idEls = [], azEls = [];
PATHS.forEach((p, i) => {
  const y = (TOP + i * PITCH) + 'px';
  const a = document.createElement('div'); a.className = 'mono p';  a.style.top = y; a.textContent = p;
  const b = document.createElement('div'); b.className = 'mono id'; b.style.top = y; b.textContent = 'req.principal';
  host.appendChild(a); host.appendChild(b); pathEls.push(a); idEls.push(b);
  if (i === 0) {
    const c = document.createElement('div'); c.className = 'mono az'; c.style.top = y; c.textContent = 'assertMember';
    host.appendChild(c); azEls.push(c);
  }
});
gsap.set([...pathEls, ...idEls, ...azEls], { opacity: 0 });
gsap.set(['#lblTop','#hdrId','#hdrAz','#n1','#n2','#n1L','#n2L','#c1','#c2'], { opacity: 0 });

tl.to('#lblTop', { opacity: 1, duration: .4, ease: R }, 0.30);
/* beat 2 — two paths, and identity on both. Fast: nobody did anything for it to be there. */
tl.to(pathEls.slice(0, 2), { opacity: 1, duration: .26, ease: R, stagger: .22 }, 2.10)
  .to('#hdrId', { opacity: 1, duration: .3, ease: R }, 2.90)
  .to(idEls.slice(0, 2), { opacity: 1, duration: .25, ease: R, stagger: .10 }, 3.10);
/* beat 3 — coverage arrives beside it, one path */
tl.to('#hdrAz', { opacity: 1, duration: .3, ease: R }, 7.00)
  .to(azEls, { opacity: 1, duration: .35, ease: R }, 7.30);
/* beat 4 — the list grows; each new path brings identity with it, coverage does not follow */
[2, 3, 4].forEach((i, k) => {
  const t = 12.20 + k * 1.30;
  tl.to(pathEls[i], { opacity: 1, duration: .28, ease: R }, t)
    .to(idEls[i], { opacity: 1, duration: .28, ease: R }, t + .16);
});
/* counts at the foot of their OWN column, never in a left stack */
tl.to(['#n1','#n1L'], { opacity: 1, duration: .35, ease: R }, 16.60)
  .to(['#n2','#n2L'], { opacity: 1, duration: .35, ease: R }, 17.20)
  .to('#c1', { opacity: 1, duration: .4, ease: R }, 18.10)
  .to('#c2', { opacity: 1, duration: .4, ease: R }, 18.90);`,
});

/* ══════════════════════ s07-name · naming · 7.5s ══════════════════════════
   beat 1 (0.00–6.87): "lỗi này có tên. phía web gọi là IDOR. trong danh sách OWASP dành
                        cho API, nó đứng số một, tên là broken object level authorization."

   A name is RECEIVED, not studied. So it takes the whole field first and admits nothing
   else for two seconds; the classification arrives afterwards and at the margin. The empty
   space is the room a name needs in order to land.                                          */
shot({
  id: 's07-name', dur: 7.5,
  note: `   s07 — THE NAME. naming.
   IDOR holds the field alone until the narration has finished saying it. Nothing else is on
   screen — no label above it, no rule beneath it. The classification is a footnote and is
   composed as one.`,
  css: `#n1 { left: 220px; top: 700px; font-size: 132px; letter-spacing: 0.04em; color: var(--ink); }
#n2 { left: 224px; top: 856px; font-size: 34px; color: var(--ink-mid); font-weight: 500; }
#rule { position: absolute; left: 224px; top: 1150px; width: 640px; height: var(--hair);
        background: var(--rule-bright); transform-origin: left center; }
#n3 { left: 224px; top: 1186px; font-size: 28px; color: var(--ink-dim); font-weight: 500; }
#n4 { left: 224px; top: 1234px; font-size: 34px; color: var(--authoritative); }
#n5 { position: absolute; left: 224px; top: 1300px; color: var(--lost); }`,
  body: `    <div class="sans" id="n1">IDOR</div>
    <div class="sans" id="n2">insecure direct object reference</div>
    <div id="rule"></div>
    <div class="sans" id="n3">owasp api security top 10 &middot; 2023</div>
    <div class="sans" id="n4">API1 &mdash; broken object level authorization</div>
    <div id="n5" class="label">hạng mục số một</div>`,
  js: `gsap.set(['#n1','#n2','#n3','#n4','#n5'], { opacity: 0 });
gsap.set('#rule', { scaleX: 0 });
/* the name, alone, for two seconds */
tl.to('#n1', { opacity: 1, duration: .5, ease: R }, 0.40)
  .to('#n2', { opacity: 1, duration: .35, ease: R }, 2.40)
/* and only then the classification, at the margin */
  .to('#rule', { scaleX: 1, duration: .5, ease: T }, 3.20)
  .to('#n3', { opacity: 1, duration: .3, ease: R }, 3.50)
  .to('#n4', { opacity: 1, duration: .4, ease: R }, 4.20)
  .to('#n5', { opacity: 1, duration: .3, ease: R }, 5.40);`,
});

/* ══════════════════════ s10-invariant · transformation · 8.0s ═════════════
   beat 1 (0.00–6.75): "OWASP viết thẳng hai vế. trừ tài nguyên công khai, mặc định là từ
                        chối. và phân quyền phải được thực thi theo quyền sở hữu bản ghi."

   TRANSFORMATION is the one operation where mass must not move. The statement holds the
   optical centre alone and one term is replaced in place. The invariant sits at the top
   edge as a PREMISE — smaller than in earlier cuts, because once stated it stops being the
   subject — and the source line sits at the bottom edge. Thin top, heavy centre, thin
   bottom: the inverse of a document page.                                                  */
shot({
  id: 's10-invariant', dur: 8,
  note: `   s10 — THE DEFAULT FLIPS. transformation.
   The replacement-in-place that H2 was forbidden is exactly right here: a default cannot be
   both things at once, so one genuinely replaces the other. In H2 the two facts were
   simultaneous and had to coexist. The test is whether both can be true at the same time.`,
  css: `#invLbl  { position: absolute; left: 93px; top: 236px; }
#invText { left: 93px; top: 284px; width: 894px; font-size: 34px; line-height: 1.22;
           color: var(--ink); }
#dLbl { position: absolute; left: 404px; top: 830px; }
#dA   { left: 289px; top: 892px; font-size: 44px; color: var(--ink); }
#dB1  { left: 355px; top: 978px; font-size: 44px; color: var(--stale); }
#dB2  { left: 408px; top: 978px; font-size: 44px; color: var(--boundary); }
#own  { left: 213px; top: 1120px; width: 700px; font-size: 38px; color: var(--boundary); }
#src  { position: absolute; left: 93px; top: 1430px; color: var(--lost); }`,
  body: `    <div id="invLbl" class="label">bất biến phải giữ</div>
    <div class="sans" id="invText">mọi truy cập tới object được bảo vệ đều phải chịu quyết định phân quyền cần thiết</div>

    <div id="dLbl" class="label">mặc định</div>
    <div class="mono" id="dA">không có quyết định</div>
    <div class="mono" id="dB1">&rarr;  trả dữ liệu</div>
    <div class="mono" id="dB2">&rarr;  từ chối</div>

    <div class="sans" id="own">thực thi theo quyền sở hữu bản ghi</div>
    <div id="src" class="label">owasp top 10 2021 &middot; a01 broken access control</div>`,
  js: `gsap.set(['#invLbl','#invText','#dLbl','#dA','#dB1','#dB2','#own','#src'], { opacity: 0 });
tl.to('#invLbl', { opacity: 1, duration: .35, ease: R }, 0.25)
  .to('#invText', { opacity: 1, duration: .45, ease: R }, 0.50);
tl.to('#dLbl', { opacity: 1, duration: .3, ease: R }, 1.50)
  .to('#dA', { opacity: 1, duration: .4, ease: R }, 1.85)
  .to('#dB1', { opacity: 1, duration: .4, ease: R }, 2.30);
/* the flip — dA never moves, only the second term is replaced */
tl.to('#dB1', { opacity: 0, duration: .4, ease: 'power2.in' }, 3.50)
  .to('#dB2', { opacity: 1, duration: .45, ease: R }, 3.80);
tl.to('#own', { opacity: 1, duration: .45, ease: R }, 4.60)
  .to('#src', { opacity: 1, duration: .35, ease: R }, 6.30);`,
});

/* ══════════════════════ s12-cost · accumulation · 12.0s ═══════════════════
   beat 1 (0.00–10.92): "cách này không miễn phí. job nền và công cụ admin thường không
                         chạy dưới danh nghĩa một người dùng nào. nên bạn phải mở một lối
                         riêng cho chúng. lối đó thành bề mặt rủi ro mới. bù lại nó nằm một
                         chỗ, nên canh được."

   The known group holds the left field; the callers that run as nobody enter the right,
   a region the first group never occupied — so they do not read as more rows of the same
   list. NO NUMBER in this shot or in s13: the cut into s14-signal has to separate two
   counting universes.
   The lane is described in prose. Inventing an API for it would be the Visual Engine
   choosing an architecture.                                                                */
shot({
  id: 's12-cost', dur: 12,
  note: `   s12 — WHAT IT COSTS. accumulation.
   The reason is stated once for the group instead of repeated beside every row: a phrase
   repeated down a column in monospace is typography wearing a label's clothes, a defect
   this video has already had to remove twice.`,
  css: `#g1Lbl { position: absolute; left: 93px; top: 250px; color: var(--authoritative); }
.p1 { left: 93px; font-size: 30px; color: var(--authoritative); }
#g2Lbl { position: absolute; left: 560px; top: 560px; width: 460px; color: var(--lost); line-height: 1.3; }
.p2 { left: 560px; font-size: 32px; color: var(--ink); }
#lane { left: 93px; top: 940px; width: 894px; font-size: 42px; color: var(--pressure); }
.trade { left: 93px; width: 894px; font-size: 38px; }
#t1 { top: 1050px; color: var(--stale); }
#t2 { top: 1112px; color: var(--boundary); }`,
  body: `    <div id="g1Lbl" class="label">chạy dưới danh nghĩa một người</div>
    <div class="mono p1" id="a1" style="top:306px">/docs/:id</div>
    <div class="mono p1" id="a2" style="top:362px">/docs/:id/comments</div>
    <div class="mono p1" id="a3" style="top:418px">/docs/:id/history</div>
    <div class="mono p1" id="a4" style="top:474px">/docs/:id/exports</div>
    <div class="mono p1" id="a5" style="top:530px">/docs/:id/print</div>

    <div id="g2Lbl" class="label">không chạy dưới danh nghĩa người dùng nào</div>
    <div class="mono p2" id="b1" style="top:648px">jobs: weekly-report</div>
    <div class="mono p2" id="b2" style="top:706px">admin: bulk-export</div>
    <div class="mono p2" id="b3" style="top:764px">migration: backfill</div>

    <div class="sans" id="lane">phải mở một lối riêng cho chúng</div>
    <div class="sans trade" id="t1">lối đó là bề mặt rủi ro mới</div>
    <div class="sans trade" id="t2">bù lại nó nằm một chỗ, nên canh được</div>`,
  js: `gsap.set(['#g1Lbl','#a1','#a2','#a3','#a4','#a5','#g2Lbl','#b1','#b2','#b3','#lane','#t1','#t2'], { opacity: 0 });
tl.to('#g1Lbl', { opacity: 1, duration: .3, ease: R }, 0.30)
  .to(['#a1','#a2','#a3','#a4','#a5'], { opacity: 1, duration: .22, ease: R, stagger: .10 }, 0.55);
tl.to('#g2Lbl', { opacity: 1, duration: .4, ease: R }, 2.40)
  .to(['#b1','#b2','#b3'], { opacity: 1, duration: .3, ease: R, stagger: .62 }, 3.00);
tl.to('#lane', { opacity: 1, duration: .45, ease: R }, 6.00)
  .to('#t1', { opacity: 1, duration: .45, ease: R }, 8.00)
  .to('#t2', { opacity: 1, duration: .45, ease: R }, 9.60);`,
});

/* ══════════════════════ s14-signal · counting · 13.0s ═════════════════════
   beat 1 (0.00–11.80): the whole signal, in one long paragraph.

   The subject is WHICH ROUTES, not how good coverage is, so there is no percentage anywhere
   and the only number is a count of work to do. A percentage invites "82% is fine"; three
   filenames invite opening three files.
   Grid deliberately unlike s14-limits': x=93 and a 46/50px pitch, against that shot's
   x=140/560 and 54px. Two counting universes separated by a cut must not line up.           */
shot({
  id: 's14-signal', dur: 13,
  note: `   s14-signal — THE SIGNAL AND WHICH ROUTES LACK IT. counting.
   Vermilion marks the group that needs attention, the same meaning it carries everywhere
   else in this library — it is not a health colour.`,
  css: `#sigLbl { position: absolute; left: 93px; top: 236px; }
.sig  { left: 93px; font-size: 28px; color: var(--ink); }
#g1Lbl{ position: absolute; left: 93px; top: 470px; color: var(--boundary); }
#g2Lbl{ position: absolute; left: 93px; top: 650px; color: var(--stale); }
.r  { left: 93px; font-size: 34px; }
.r1 { color: var(--ink-mid); }
.r2 { color: var(--ink); }
#todo { left: 93px; top: 900px; width: 894px; font-size: 42px; color: var(--stale); }
#todo b { font-family: var(--font-value); }`,
  body: `    <div id="sigLbl" class="label">tín hiệu</div>
    <div class="mono sig" id="s1" style="top:286px">route nhận object id từ client</div>
    <div class="mono sig" id="s2" style="top:332px">&rarr; gọi lại bằng principal thứ hai</div>
    <div class="mono sig" id="s3" style="top:378px">&rarr; khẳng định không nhận 200</div>

    <div id="g1Lbl" class="label">đã có test đó</div>
    <div class="mono r r1" id="a1" style="top:516px">/docs/:id</div>
    <div class="mono r r1" id="a2" style="top:566px">/docs/:id/comments</div>

    <div id="g2Lbl" class="label">chưa có &middot; đây là chỗ cần soát</div>
    <div class="mono r r2" id="b1" style="top:696px">/docs/:id/history</div>
    <div class="mono r r2" id="b2" style="top:746px">/docs/:id/exports</div>
    <div class="mono r r2" id="b3" style="top:796px">/docs/:id/print</div>

    <div class="sans" id="todo"><b>3</b> route cần mở ra xem</div>`,
  js: `gsap.set(['#sigLbl','#s1','#s2','#s3','#g1Lbl','#a1','#a2','#g2Lbl','#b1','#b2','#b3','#todo'], { opacity: 0 });
tl.to('#sigLbl', { opacity: 1, duration: .3, ease: R }, 0.30)
  .to(['#s1','#s2','#s3'], { opacity: 1, duration: .3, ease: R, stagger: .90 }, 0.80);
tl.to('#g1Lbl', { opacity: 1, duration: .3, ease: R }, 4.60)
  .to(['#a1','#a2'], { opacity: 1, duration: .26, ease: R, stagger: .30 }, 4.90);
/* the group that is the point: slower, brighter, longer */
tl.to('#g2Lbl', { opacity: 1, duration: .4, ease: R }, 7.00)
  .to(['#b1','#b2','#b3'], { opacity: 1, duration: .3, ease: R, stagger: .55 }, 7.40)
  .to('#todo', { opacity: 1, duration: .45, ease: R }, 10.00);`,
});

/* ══════════════════════ s15-question · hold · 7.5s ════════════════════════
   beat 1 (0.00–4.87), then 2.63s of silence — the longest hold in the video.

   Every other shot establishes top-down: given, then concluded. Ending with the ink low and
   the field above it open means nothing precedes the question, so it is not a conclusion.
   Predicted to be the only shot whose bottom half carries more mass than its top.           */
shot({
  id: 's15-question', dur: 7.5,
  note: `   s15 — THE QUESTION. hold.
   The empty field above is the composition, not leftover margin: an unanswered question
   cannot sit under a heading. No summary, no recap, no call to action.`,
  css: `.q  { left: 93px; width: 894px; font-size: 54px; line-height: 1.22; }
#q1 { top: 1150px; color: var(--ink); }
#q2 { top: 1226px; color: var(--ink); }
#q3 { top: 1302px; color: var(--stale); }`,
  body: `    <div class="sans q" id="q1">endpoint gần nhất bạn thêm vào</div>
    <div class="sans q" id="q2">nó tự kiểm quyền trên object,</div>
    <div class="sans q" id="q3">hay nó tin vào tầng phía trên?</div>`,
  js: `gsap.set(['#q1','#q2','#q3'], { opacity: 0 });
tl.to('#q1', { opacity: 1, duration: .5, ease: R }, 0.35)
  .to('#q2', { opacity: 1, duration: .5, ease: R }, 1.45)
  .to('#q3', { opacity: 1, duration: .5, ease: R }, 2.65);`,
});

console.log('group B done');
