/**
 * F01 Step 5 — group A: inspection (s01, s05) and narrowing (s02-eliminate, s08, s09,
 * s13, s14-limits).
 *
 * Every tween time in here is taken from voice/shot_timing.json — the measured offset of
 * each narration beat inside its own shot. Nothing is estimated.
 *
 * The five narrowing shots deliberately do five different things, because five different
 * kinds of set are being narrowed. Same family, same reason, different spatial operation —
 * see `narrowing_object` in shot_plan.yaml.
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
.sans { position: absolute; font-family: var(--font-label); letter-spacing: 0.01em; font-weight: 600; }
.kill { position: absolute; height: 3px; background: var(--lost); width: 0; }`;

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

/* ═══════════════════════════════════ s01-leak · inspection · 7.0s ═════════
   beat 1 (0.00–5.50), two sentences:
     ~0.0–2.5  "một người đã bị xoá khỏi workspace ba tháng trước"
     ~2.5–5.5  "họ vẫn đọc được comment trong tài liệu nội bộ của bạn"
   so the person is the GIVEN and lands first, at the top edge; the payload occupies the
   centre band while the second sentence plays; the consequence lands at the bottom edge.  */
shot({
  id: 's01-leak', dur: 7,
  note: `   s01 — THE LEAK. inspection.
   What ARRIVES occupies: the payload is the frame's mass, full width, and the long lines
   are CLIPPED by the right edge. The empty space means the frame does not contain what it
   is showing — you are holding a fragment of something larger. No 93px margin ritual,
   because nobody laid this out; it is what came back.`,
  css: `#who   { position: absolute; left: 60px; top: 210px; width: 960px; color: var(--stale); line-height: 1.3; }
#meta  { left: 60px; top: 470px; font-size: 28px; color: var(--ink-mid); }
#meta em { font-style: normal; color: var(--stale); font-weight: 600; }
.cmt   { left: 60px; font-size: 44px; color: var(--ink); }
#wrong { left: 60px; top: 1280px; width: 960px; font-size: 52px; color: var(--ink); }`,
  body: `    <div id="who" class="label">người này đã bị xoá khỏi workspace ba tháng trước</div>
    <div class="mono" id="meta">GET /documents/d41/comments  &rarr;  <em>200</em></div>
    <div class="mono cmt" id="l1" style="top:760px">"ngân sách Q4 chốt ở mức 4.2 tỷ, chưa gồm headcount"</div>
    <div class="mono cmt" id="l2" style="top:838px">"đừng forward file này ra ngoài team"</div>
    <div class="mono cmt" id="l3" style="top:916px">"bản cũ có số sai, dùng bản ngày 14 nhé"</div>
    <div class="mono cmt" id="l4" style="top:994px">"lịch họp với đối tác dời sang thứ năm tuần sau"</div>
    <div class="sans" id="wrong">họ vẫn đọc được</div>`,
  js: `gsap.set(['#who','#meta','#l1','#l2','#l3','#l4','#wrong'], { opacity: 0 });
tl.to('#who', { opacity: 1, duration: .45, ease: R }, 0.35)
  .to('#meta', { opacity: 1, duration: .35, ease: R }, 2.20)
  .to(['#l1','#l2','#l3','#l4'], { opacity: 1, duration: .3, ease: R, stagger: .48 }, 2.70)
  .to('#wrong', { opacity: 1, duration: .5, ease: R }, 4.90);`,
});

/* ═══════════════════════════════════ s05-response · inspection · 3.0s ═════
   beat 1 (0.00–1.97): "server trả về hai trăm, kèm dữ liệu."
   A RECALL, not a new observation: same geometry as s01, so the frame arrives whole
   rather than being built. Three seconds is a beat of recognition.                        */
shot({
  id: 's05-response', dur: 3,
  note: `   s05 — THE SAME 200, NOW EXPLAINED. inspection.
   Identical geometry to s01 — same left edge, same clipped payload, same centre band.
   Declared intentional_repetition: the rhyme IS the content. Shot 01 was the symptom with
   no explanation; this is the same observation with the cause known. The frame does not
   rebuild itself, because the viewer has already read it once.`,
  css: `#meta  { left: 60px; top: 470px; font-size: 28px; color: var(--ink-mid); }
#meta em { font-style: normal; color: var(--stale); font-weight: 700; }
.cmt   { left: 60px; font-size: 44px; color: var(--ink); }
#cause { left: 60px; top: 1280px; width: 960px; font-size: 40px; color: var(--stale); }`,
  body: `    <div class="mono" id="meta">GET /documents/d41/comments  &rarr;  <em>200</em></div>
    <div class="mono cmt" id="l1" style="top:760px">"ngân sách Q4 chốt ở mức 4.2 tỷ, chưa gồm headcount"</div>
    <div class="mono cmt" id="l2" style="top:838px">"đừng forward file này ra ngoài team"</div>
    <div class="mono cmt" id="l3" style="top:916px">"bản cũ có số sai, dùng bản ngày 14 nhé"</div>
    <div class="mono cmt" id="l4" style="top:994px">"lịch họp với đối tác dời sang thứ năm tuần sau"</div>
    <div class="sans" id="cause">trên đường này không có quyết định phân quyền nào</div>`,
  js: `gsap.set(['#meta','#l1','#l2','#l3','#l4','#cause'], { opacity: 0 });
tl.to(['#meta','#l1','#l2','#l3','#l4'], { opacity: 1, duration: .3, ease: R }, 0.10)
  .to('#cause', { opacity: 1, duration: .45, ease: R }, 1.40);`,
});

/* ═════════════════════════ s02-eliminate · narrowing · 9.5s ═══════════════
   beat 1 (0.00–5.72) "một dữ kiện, ba giả thuyết bị loại. xác thực không hỏng.
                       dữ liệu membership không sai. quyền đã được thu hồi."
   beat 2 (5.72–8.27) "chỉ có một đường khác không trả về bốn không ba."

   Narrowing an object that is a set of COMPETING EXPLANATIONS -> CONVERGENCE.
   The three evidence items are carried in from s02-guess at their positions. Each
   hypothesis arrives ALREADY STRUCK beside the fact that killed it — the fact came first,
   so the hypothesis never gets to stand. Then everything clears and the survivor lands in
   the space they vacated, low and alone.                                                  */
shot({
  id: 's02-eliminate', dur: 9.5,
  note: `   s02-eliminate — THREE EXPLANATIONS DIE ON ONE FACT. narrowing by CONVERGENCE.
   The set being narrowed is a set of competing explanations, so the operation is
   convergence: candidates spread across a wide field, then the survivor occupies what they
   vacated. Distinct from the other four narrowing shots — see narrowing_object in the plan.
   Each hypothesis arrives struck. It is not eliminated after standing; the fact was already
   there.`,
  css: `.ev   { font-size: 30px; color: var(--ink-mid); }
.ev em { font-style: normal; color: var(--boundary); font-weight: 600; }
.hyp  { font-size: 27px; color: var(--lost); }
#lbl  { position: absolute; left: 93px; top: 250px; }
#surv { left: 93px; top: 1180px; width: 894px; font-size: 48px; color: var(--stale); }`,
  body: `    <div id="lbl" class="label">một dữ kiện &middot; ba giả thuyết</div>

    <div class="mono ev"  id="e1" style="left:520px;top:430px">token đó hết hạn từ lâu</div>
    <div class="mono hyp" id="h1" style="left:520px;top:478px">xác thực hỏng</div>
    <div class="kill" id="k1" style="left:515px;top:490px"></div>

    <div class="mono ev"  id="e2" style="left:180px;top:640px">membership đã bị xoá thật</div>
    <div class="mono hyp" id="h2" style="left:180px;top:688px">dữ liệu membership sai</div>
    <div class="kill" id="k2" style="left:175px;top:700px"></div>

    <div class="mono ev"  id="e3" style="left:600px;top:860px">GET /documents/d41 &rarr; <em>403</em></div>
    <div class="mono hyp" id="h3" style="left:600px;top:908px">quyền chưa thu hồi</div>
    <div class="kill" id="k3" style="left:595px;top:920px"></div>

    <div class="sans" id="surv">chỉ có một đường khác không trả 403</div>`,
  js: `/* evidence is carried in from s02-guess at the same coordinates */
gsap.set(['#lbl','#h1','#h2','#h3','#surv'], { opacity: 0 });
tl.to('#lbl', { opacity: 1, duration: .35, ease: R }, 0.30);
/* each hypothesis appears already struck — the fact preceded it */
[['#h1','#k1',330],['#h2','#k2',352],['#h3','#k3',300]].forEach(([h,k,w],i) => {
  const t = 1.90 + i * 1.25;
  tl.to(h, { opacity: 1, duration: .25, ease: R }, t)
    .to(k, { width: w, duration: .32, ease: T }, t + .10);
});
/* 5.20 — everything clears; the footprint collapses */
tl.to(['#e1','#e2','#e3','#h1','#h2','#h3','#k1','#k2','#k3','#lbl'],
      { opacity: 0, duration: .55, ease: 'power2.in' }, 5.20);
/* beat 2 — the survivor takes the vacated field, low */
tl.to('#surv', { opacity: 1, duration: .5, ease: R }, 5.95);`,
});

/* ═════════════════════════ s08-not-id · narrowing · 11.5s ═════════════════
   beat 1 (0.00–4.08)  "ở đây id là UUID. người kia không đoán ra nó. họ có nó từ hồi
                        còn là thành viên."
   beat 2 (4.08–8.61)  "id khó đoán làm việc dò tìm đắt hơn. nó không sinh ra quyền, và
                        cũng không xoá đi quyền."
   beat 3 (8.61–10.65) "nên cách sửa không nằm ở việc đổi id."

   The set being narrowed is the SCOPE OF A CLAIM about a real object. So the object holds
   absolutely still at the optical centre and the claim territory contracts around it: wide
   sentences give way to narrow ones, and the last one is the shortest and closest.         */
shot({
  id: 's08-not-id', dur: 11.5,
  note: `   s08 — NOT THE ID. narrowing by CLAIM CONTRACTING AROUND A FIXED OBJECT.
   The UUID never moves and never changes size. What narrows is the width of what is said
   about it: two wide claims above, then two narrower true ones, then one short conclusion
   nearest the object. The id is shown at full length because the whole point is that it is
   unguessable AND did not need guessing.`,
  css: `#idLbl { position: absolute; left: 93px; top: 830px; color: var(--ink-dim); }
#id    { left: 93px; top: 876px; font-size: 34px; color: var(--ink); }
.claim { left: 93px; font-weight: 600; }
#f1 { top: 560px; font-size: 38px; color: var(--ink); width: 894px; }
#f2 { top: 620px; font-size: 38px; color: var(--ink); width: 894px; }
#f3 { top: 1010px; font-size: 36px; color: var(--boundary); width: 700px; }
#f4 { top: 1068px; font-size: 36px; color: var(--stale); width: 700px; }
#f5 { top: 1170px; font-size: 44px; color: var(--ink); width: 620px; }`,
  body: `    <div class="sans claim" id="f1">họ không đoán ra nó</div>
    <div class="sans claim" id="f2">họ có nó từ hồi còn là thành viên</div>

    <div id="idLbl" class="label">id ở đây là</div>
    <div class="mono" id="id">d41f8c2e-7b19-4a63-9f02-1c8e5b7a3d90</div>

    <div class="sans claim" id="f3">khó đoán làm việc dò tìm đắt hơn</div>
    <div class="sans claim" id="f4">không sinh ra quyền &middot; không xoá đi quyền</div>
    <div class="sans claim" id="f5">nên cách sửa không nằm ở việc đổi id</div>`,
  js: `gsap.set(['#idLbl','#id','#f1','#f2','#f3','#f4','#f5'], { opacity: 0 });
/* beat 1 — the object, then two wide claims about how it was obtained */
tl.to(['#idLbl','#id'], { opacity: 1, duration: .4, ease: R, stagger: .12 }, 0.30)
  .to('#f1', { opacity: 1, duration: .35, ease: R }, 1.50)
  .to('#f2', { opacity: 1, duration: .35, ease: R }, 2.70);
/* beat 2 — the wide claims give way; what replaces them is narrower and sits closer.
   The id itself is never touched by any tween in this timeline. */
tl.to(['#f1','#f2'], { opacity: 0, duration: .45, ease: 'power2.in' }, 4.20)
  .to('#f3', { opacity: 1, duration: .4, ease: R }, 4.90)
  .to('#f4', { opacity: 1, duration: .4, ease: R }, 6.60);
/* beat 3 — narrowest, nearest */
tl.to('#f5', { opacity: 1, duration: .45, ease: R }, 8.80);`,
});

/* ═════════════════════════ s09-not-a-line · narrowing · 6.0s ══════════════
   beat 1 (0.00–5.19): "cũng không nằm ở việc thêm một dòng check vào handler mới.
                        nhớ thêm một dòng chính là thứ vừa hỏng."

   One proposed ACTION, rejected. There is no set to converge and no claim to shrink, so
   the operation is EXCISION: the proposal is removed and the space it occupied stays
   empty, and the reason appears somewhere else entirely. The hole is the content — that is
   where you wanted to put the fix, and it is not there.                                    */
shot({
  id: 's09-not-a-line', dur: 6,
  note: `   s09 — NOT ONE MORE LINE. narrowing by EXCISION.
   The struck line is a PROPOSAL, never a step in an execution path. Cancelling something
   inside a handler body would teach "the check was skipped", which the semantic locks
   forbid. Here it is an idea being refused, and after it goes the space stays empty while
   the reason appears at a different position — so the eye registers absence rather than
   substitution.`,
  css: `#q    { left: 300px; top: 380px; width: 700px; font-size: 40px; color: var(--ink-dim); }
#code { left: 300px; top: 470px; font-size: 36px; color: var(--ink-mid); }
#why  { left: 93px; top: 900px; width: 894px; font-size: 46px; color: var(--stale); }
#why2 { position: absolute; left: 93px; top: 1010px; width: 894px; }`,
  body: `    <div class="sans" id="q">thêm một dòng check vào handler mới?</div>
    <div class="mono" id="code" data-layout-allow-occlusion>  assertMember(req.principal, doc)</div>
    <div class="kill" id="k" style="left:295px;top:486px"></div>
    <div class="sans" id="why">nhớ thêm một dòng chính là thứ vừa hỏng</div>
    <div id="why2" class="label">nghĩa vụ không thể đặt lên trí nhớ</div>`,
  js: `gsap.set(['#q','#code','#why','#why2'], { opacity: 0 });
tl.to('#q', { opacity: 1, duration: .35, ease: R }, 0.25)
  .to('#code', { opacity: 1, duration: .35, ease: R }, 0.90)
  .to('#k', { width: 700, duration: .45, ease: T }, 2.10)
/* excised — and nothing moves into the gap */
  .to(['#q','#code','#k'], { opacity: 0, duration: .5, ease: 'power2.in' }, 3.00)
/* the reason arrives somewhere else */
  .to('#why', { opacity: 1, duration: .45, ease: R }, 3.60)
  .to('#why2', { opacity: 1, duration: .4, ease: R }, 4.60);`,
});

/* ═════════════════════════ s13-scope-limits · narrowing · 7.0s ════════════
   beat 1 (0.00–5.85): "và nó chỉ phủ quan hệ sở hữu. chia sẻ có điều kiện, quyền uỷ
                        quyền, vai trò lồng nhau vẫn cần một tầng policy thật."

   What narrows here is not a count but a SCOPE OF APPLICABILITY, so the operation is a
   downward migration of mass: the claim starts high and universal-looking, and the frame's
   weight moves down as it becomes specific. The cases below were never in scope — this is
   not a list of failures, and nothing is struck.
   NO NUMBER IN THIS SHOT: the cut into s14-signal has to separate two counting universes,
   and it cannot do that if this shot is already counting.                                  */
shot({
  id: 's13-scope-limits', dur: 7,
  note: `   s13 — HOW FAR IT REACHES. narrowing by DOWNWARD MIGRATION OF MASS.
   Reach is stated first and positively; the cases needing a real policy layer arrive lower
   and smaller. Nothing is eliminated, because none of them were ever claimed.`,
  css: `#lblTop { position: absolute; left: 93px; top: 330px; }
#covers { left: 93px; top: 380px; width: 894px; font-size: 50px; color: var(--boundary); }
#notLbl { position: absolute; left: 300px; top: 800px; width: 720px; color: var(--stale); }
.n      { left: 300px; font-size: 34px; color: var(--ink); }
#close  { left: 300px; top: 1210px; width: 720px; font-size: 34px; color: var(--ink-dim); }`,
  body: `    <div id="lblTop" class="label">cách này phủ tới đâu</div>
    <div class="sans" id="covers">quan hệ sở hữu &middot; quan hệ thành viên</div>

    <div id="notLbl" class="label">còn lại vẫn cần một tầng policy thật</div>
    <div class="mono n" id="n1" style="top:860px">chia sẻ có điều kiện</div>
    <div class="mono n" id="n2" style="top:920px">quyền uỷ quyền</div>
    <div class="mono n" id="n3" style="top:980px">vai trò lồng nhau</div>

    <div class="sans" id="close">bất biến không đổi &mdash; chỉ là quyết định phức tạp hơn</div>`,
  js: `gsap.set(['#lblTop','#covers','#notLbl','#n1','#n2','#n3','#close'], { opacity: 0 });
tl.to('#lblTop', { opacity: 1, duration: .35, ease: R }, 0.25)
  .to('#covers', { opacity: 1, duration: .5, ease: R }, 0.55)
  .to('#notLbl', { opacity: 1, duration: .4, ease: R }, 2.10)
  .to(['#n1','#n2','#n3'], { opacity: 1, duration: .3, ease: R, stagger: .55 }, 2.60)
  .to('#close', { opacity: 1, duration: .45, ease: R }, 4.70);`,
});

/* ═════════════════════════ s14-limits · narrowing · 16.0s ═════════════════
   beat 1 (0.00–4.80)   "con số đó nói cho bạn biết còn đường nào chưa ai kiểm.
                         nó không nói phân quyền của bạn đúng."
   beat 2 (4.80–11.58)  "test xanh chỉ chứng minh tài khoản trong fixture bị chặn.
                         cựu thành viên, quyền vừa thu hồi, vai trò lồng nhau…"
   beat 3 (11.58–14.58) "và nó không chạm tới đường nào không đi qua route HTTP."

   The set being narrowed is WHAT A SIGNAL PROVES, so the claim stands and loses weight as
   qualifications accumulate under it — it is never struck, because it is not false.
   The grid is deliberately offset from s14-signal's: two counting universes separated by a
   cut must not share a baseline in either axis, or the cut reads as one tally continuing.  */
shot({
  id: 's14-limits', dur: 16,
  note: `   s14-limits — WHAT THE GREEN TEST DOES NOT PROVE. narrowing by LOSS OF WEIGHT.
   The claim stays on screen the whole shot and is never struck: it is true, just narrower
   than it looks. Each qualification lands beneath it and the claim dims a step. Baselines
   are offset from s14-signal on purpose — the two universes do not add up, and after the
   split that non-alignment has to survive a cut.`,
  css: `#claim  { left: 140px; top: 300px; width: 860px; font-size: 44px; color: var(--ink); }
#q1     { position: absolute; left: 140px; top: 430px; width: 860px; color: var(--stale); line-height: 1.3; }
#limLbl { position: absolute; left: 560px; top: 620px; width: 460px; color: var(--lost); }
.lim    { left: 560px; font-size: 32px; color: var(--ink-mid); }
#http   { position: absolute; left: 200px; top: 1010px; width: 700px; color: var(--lost); line-height: 1.3; }
#ceil   { left: 140px; top: 1180px; width: 860px; font-size: 34px; color: var(--stale); line-height: 1.28; }`,
  body: `    <div class="sans" id="claim">test xanh chứng minh phân quyền của bạn đúng</div>
    <div id="q1" class="label">nó chỉ nói còn đường nào chưa ai kiểm</div>

    <div id="limLbl" class="label">nó không phủ</div>
    <div class="mono lim" id="m1" style="top:676px">cựu thành viên</div>
    <div class="mono lim" id="m2" style="top:730px">quyền vừa thu hồi</div>
    <div class="mono lim" id="m3" style="top:784px">vai trò lồng nhau</div>

    <div id="http" class="label">và không chạm tới đường nào không đi qua route http</div>
    <div class="sans" id="ceil">phủ hết mọi route cũng chỉ chứng minh CÓ một quyết định ở mỗi đường</div>`,
  js: `gsap.set(['#claim','#q1','#limLbl','#m1','#m2','#m3','#http','#ceil'], { opacity: 0 });
/* the claim stands first, at full weight */
tl.to('#claim', { opacity: 1, duration: .45, ease: R }, 0.30)
  .to('#q1', { opacity: 1, duration: .4, ease: R }, 1.60);
/* beat 2 — qualifications accumulate; the claim loses a step of weight at each one */
tl.to('#limLbl', { opacity: 1, duration: .35, ease: R }, 5.10)
  .to('#m1', { opacity: 1, duration: .3, ease: R }, 5.60)
  .to('#claim', { color: '#9AA0A6', duration: .5, ease: 'none' }, 5.60)
  .to('#m2', { opacity: 1, duration: .3, ease: R }, 7.20)
  .to('#m3', { opacity: 1, duration: .3, ease: R }, 8.80)
  .to('#claim', { color: '#6A6F74', duration: .6, ease: 'none' }, 8.80);
/* beat 3 */
tl.to('#http', { opacity: 1, duration: .4, ease: R }, 11.80)
  .to('#ceil', { opacity: 1, duration: .5, ease: R }, 13.20);`,
});

console.log('group A done');
