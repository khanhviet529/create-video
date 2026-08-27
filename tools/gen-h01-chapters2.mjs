/**
 * H01 · năm chương còn lại, CÂM. Phủ nốt beat 1–15, 20–24, 39.
 *
 * §7: các chương này phần lớn là setup và ending, rủi ro thấp — KHÔNG dựng công phu hơn mức
 * cần. Ba chương lõi (CH-B · CH-A · CH-C) mới là chỗ video sống hoặc chết.
 *
 * Trần tỉ lệ = 1, đã đo và đã chấp nhận. KHÔNG thêm nấc giả để bù:
 *   CÚ VÀO  ở ranh giới beat 7 → 8   (giao diện người dùng → lịch sử replication)
 *   CÚ RA   ở ranh giới beat 38 → 39 (dụng cụ đo → câu hỏi cho người xem)
 * Bên trong: không nấc nào, và không chương nào ở đây cố tạo ra một nấc.
 *
 * Timing từng shot đặt theo nhu cầu dựng. KHÔNG neo vào 169s, kể cả tạm thời.
 */
import { G, X, CSS, BASE_BODY, HELPERS, build } from './h01-shared.mjs';

/* ══════════════════ CH-1 · Sự cố (beat 1–7) ═══════════════════════════════════
   Chưa có thế giới log. Hai ô đọc: cái người dùng thấy, và cái primary giữ.
   Cái người dùng thấy LÙI VỀ giá trị cũ; cái primary giữ thì KHÔNG BAO GIỜ đổi.
   Đó là stale ≠ lost ở mức sự cố, dựng bằng SỰ CÓ MẶT chứ không bằng nhãn — và nó không
   cần một chữ "mất dữ liệu" nào trên màn hình để bác chữ đó. */
const RO = { x: 150, yU: 820, yP: 1080, w: 780 };
build({
  id: 'ch1-su-co', dur: 14,
  note: '   CH-1 · sự cố. Hai ô đọc, một giá trị. Ô của người dùng lùi về cũ; ô của primary\n'
      + '   không đổi. Beat 4 ("họ gọi đó là mất dữ liệu") và beat 5 ("không có gì mất") là MỘT\n'
      + '   chuyện xảy ra với một vật, không phải hai câu chữ: giá trị mới vẫn nằm đó suốt.\n'
      + '   Chưa có đường lịch sử — cú vào tỉ lệ nằm ở ranh giới sang CH-2.',
  css: `
#uLbl, #pLbl { position: absolute; left: ${RO.x}px; font-family: var(--font-label); font-size: 26px;
       letter-spacing: .14em; text-transform: uppercase; font-weight: 500; color: var(--ink-dim); }
#uLbl { top: ${RO.yU - 46}px; } #pLbl { top: ${RO.yP - 46}px; }
.rule2 { position: absolute; left: ${RO.x}px; width: ${RO.w}px; height: 1.5px; background: var(--rule); }
.vv { position: absolute; left: ${RO.x}px; font-family: var(--font-value); font-size: 54px;
      color: var(--ink); }`,
  body: `    <div id="uLbl">người dùng thấy</div>
    <div class="rule2" style="top:${RO.yU + 22}px"></div>
    <div id="pLbl">primary giữ</div>
    <div class="rule2" style="top:${RO.yP + 22}px"></div>`,
  js: [
    'function val(top, text, cls) {',
    "  const d = document.createElement('div');",
    "  d.className = 'vv' + (cls ? ' ' + cls : '');",
    "  d.style.top = top + 'px'; d.textContent = text;",
    '  stage.appendChild(d); return d;',
    '}',
    "gsap.set(['#uLbl','#pLbl','.rule2'], { opacity: 0 });",
    '',
    '/* beat 1-2 — hệ chạy tốt. Chỉ có ô của người dùng, và nó mang giá trị mới. */',
    "tl.to(['#uLbl','.rule2'], { opacity: 1, duration: .5, ease: R }, 0.5);",
    "const uNew = val(" + RO.yU + ", 'giá trị mới');",
    "const uOld = val(" + RO.yU + ", 'giá trị cũ');",
    'gsap.set([uNew, uOld], { opacity: 0 });',
    'tl.to(uNew, { opacity: 1, duration: .45, ease: R }, 1.6);',
    '',
    '/* beat 3 — bấm F5, và ô của người dùng LÙI VỀ giá trị cũ */',
    'tl.to(uNew, { opacity: 0, duration: .3, ease: T }, 4.6);',
    'tl.to(uOld, { opacity: 1, duration: .4, ease: R }, 4.9);',
    '',
    '/* beat 4-5 — không cần chữ "mất dữ liệu" để bác chữ "mất dữ liệu": ô thứ hai mở ra và',
    '   giá trị mới VẪN NẰM ĐÓ. Bác bằng một vật, không bằng một câu. */',
    "tl.to(['#pLbl'], { opacity: 1, duration: .5, ease: R }, 6.8);",
    "const pNew = val(" + RO.yP + ", 'giá trị mới');",
    'gsap.set(pNew, { opacity: 0 });',
    'tl.to(pNew, { opacity: 1, duration: .5, ease: R }, 7.4);',
    '',
    '/* beat 6-7 — cả hai ô giữ nguyên. Không ô nào sai; chúng trả lời hai câu hỏi khác nhau. */',
  ].join('\n'),
});

/* ══════════════════ CH-2 · Cơ chế (beat 8–12) ═════════════════════════════════
   CÚ VÀO TỈ LỆ. Hai ô đọc nhường chỗ cho đường lịch sử, và từ đây tới hết CH-C thế giới
   là một. Beat 12 nói về ĐỘ TRỄ — một chuyện thời gian — nhưng thế giới này là vị trí, nên
   độ trễ được chở bằng việc đầu mút tiền tố dưới TỚI MUỘN, không bằng một trục thời gian. */
build({
  id: 'ch2-co-che', dur: 17,
  note: '   CH-2 · cơ chế. Cú vào tỉ lệ: từ ô đọc giao diện sang lịch sử replication.\n'
      + '   Beat 12 nói về độ trễ (thời gian) trong khi thế giới là vị trí — nên độ trễ hiện ra\n'
      + '   ở việc đầu mút tiền tố dưới TỚI MUỘN, chứ không phải bằng một trục thời gian mới.',
  body: BASE_BODY(),
  js: [
    "gsap.set(['#bPri','#cPri','#bRep','#cRep','#lPri','#lRep','#gapb'], { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 0 });",
    "gsap.set('#hist', { scaleX: 0, transformOrigin: 'left center' });",
    '',
    '/* beat 8 — một cái log, và replica chạy lại đúng cái log đó */',
    "tl.to('#hist', { scaleX: 1, duration: .9, ease: R }, 0.4);",
    "tl.to('.pt', { opacity: 1, duration: .35, stagger: .1 }, 1.2);",
    "tl.to('.pn', { opacity: 1, duration: .35, stagger: .1 }, 1.4);",
    '',
    '/* beat 9 — primary commit ở 500 */',
    'const W = mark(500, true); gsap.set(W, { opacity: 0 });',
    "tl.to(['#bPri','#cPri','#lPri'], { opacity: 1, duration: .55, ease: R }, 3.6);",
    "tl.to(W, { opacity: 1, duration: .4, ease: R }, 4.4);",
    '',
    '/* beat 10 — replica lúc đó đang ở 499 */',
    "tl.to(['#bRep','#cRep','#lRep'], { opacity: 1, duration: .6, ease: R }, 6.6);",
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 7.6);",
    '',
    '/* beat 11 — câu đọc chạy trên replica, và thấy đúng thế giới ở vị trí của nó */',
    'const Rd = mark(499, false); gsap.set(Rd, { opacity: 0 });',
    "const sd = serve(499, 'down'); gsap.set(sd, { opacity: 0, scaleY: 0 });",
    "tl.to(Rd, { opacity: 1, duration: .45, ease: R }, 9.2);",
    "tl.to(sd, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 9.6);",
    '',
    '/* beat 12 — bất đồng bộ mặc định: đầu mút dưới TỚI MUỘN. Không trục thời gian nào. */',
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.3, ease: T }, 12.6);",
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.3, ease: T }, 12.6);",
    "tl.to('#gapb', { opacity: 0, duration: .6, ease: T }, 13.0);",
  ].join('\n'),
});

/* ══════════════════ CH-3 · Cửa sổ (beat 13–15) ════════════════════════════════
   Cặp không tách rời số 1. Chỗ đã chốt ở cổng chặn: một thiết bị thời gian riêng, DÙNG LẠI
   quan hệ BAO HÀM — hai khoảng chung gốc, và B kết thúc BÊN TRONG A. Cùng vị từ với nền,
   áp lên một tập khác (thời điểm thay vì vị trí), nên người xem không phải học phép đọc thứ hai. */
const TL = { x: 200, y: 1330, w: 700, aFrac: 0.86, bFrac: 0.52 };
build({
  id: 'ch3-cua-so', dur: 12,
  note: '   CH-3 · cửa sổ. Hai khoảng CHUNG GỐC trên một trục thời gian riêng, và khoảng B kết\n'
      + '   thúc BÊN TRONG khoảng A. Cùng quan hệ trong/ngoài với thế giới nền — chỉ đổi tập.\n'
      + '   Beat 13 đứng một mình dạy NGƯỢC lại, nên A và B phải cùng có mặt trước khi giữ.',
  css: `
#tax { position: absolute; left: ${TL.x}px; top: ${TL.y}px; width: ${TL.w}px; height: 2px;
       background: var(--rule-bright); }
#torg { position: absolute; left: ${TL.x - 1}px; top: ${TL.y - 26}px; width: 3px; height: 54px;
        background: var(--ink-dim); }
.span { position: absolute; height: 5px; transform-origin: left center; border-radius: 3px; }
#spA { top: ${TL.y - 42}px; background: var(--ink-mid); }
#spB { top: ${TL.y + 34}px; background: var(--ink); }
.slbl { position: absolute; font-family: var(--font-label); font-size: 26px; letter-spacing: .14em;
        text-transform: uppercase; font-weight: 500; color: var(--ink-dim); }
#lA { left: ${TL.x}px; top: ${TL.y - 88}px; }
#lB { left: ${TL.x}px; top: ${TL.y + 62}px; }
#lorg { left: ${TL.x}px; top: ${TL.y + 116}px; color: var(--counterfactual); }`,
  body: BASE_BODY() + `
    <div id="tax"></div>
    <div id="torg"></div>
    <div class="span" id="spA" style="left:${TL.x}px;width:${Math.round(TL.w * TL.aFrac)}px"></div>
    <div class="span" id="spB" style="left:${TL.x}px;width:${Math.round(TL.w * TL.bFrac)}px"></div>
    <div class="slbl" id="lA">độ trễ replication</div>
    <div class="slbl" id="lB">lưu → câu đọc kế tiếp</div>
    <div class="slbl" id="lorg">cùng một mốc: lúc commit</div>`,
  js: [
    '/* thế giới BỀN: đường lịch sử và hai dấu ở nguyên. Chỉ ĐOẠN BAO bị bỏ — tức bỏ khẳng',
    '   định về vị trí, đúng thứ R18 đòi cho cửa sổ hệ đồng hồ ở CH-B ngay sau đây. */',
    "gsap.set(['#bPri','#cPri','#bRep','#cRep','#lPri','#lRep','#gapb'], { opacity: 0 });",
    "gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "gsap.set([W, Rd], { opacity: 1 });",
    "gsap.set(['#tax','#torg','#lorg'], { opacity: 0 });",
    "gsap.set(['#spA','#lA','#spB','#lB'], { opacity: 0 });",
    "gsap.set(['#spA','#spB'], { scaleX: 0 });",
    '',
    '/* trục thời gian và mốc chung — thiết bị này chỉ sống ở ba beat rồi nghỉ */',
    "tl.to(['#tax','#torg','#lorg'], { opacity: 1, duration: .5, ease: R }, 0.4);",
    '',
    '/* beat 13 — con số có nguồn: độ trễ thường dưới một giây */',
    "tl.to('#lA', { opacity: 1, duration: .4, ease: R }, 1.6);",
    "tl.to('#spA', { opacity: 1, scaleX: 1, duration: .8, ease: T }, 1.9);",
    '',
    '/* beat 14 — và khoảng giữa lưu với câu đọc kế tiếp CŨNG dưới một giây */',
    "tl.to('#lB', { opacity: 1, duration: .4, ease: R }, 5.0);",
    "tl.to('#spB', { opacity: 1, scaleX: 1, duration: .8, ease: T }, 5.3);",
    '',
    '/* beat 15 — B kết thúc BÊN TRONG A. Cùng quan hệ trong/ngoài của thế giới nền. */',
    "tl.to(['#spA','#spB'], { opacity: 1, duration: .3 }, 8.4);",
  ].join('\n'),
});

/* ══════════════════ CH-4 · Bảo đảm và cái giá (beat 20–24) ════════════════════
   R4. HAI bảo đảm, và chúng phải hiện ra như HAI LOẠI KHẲNG ĐỊNH:
     read-your-writes  = một CẶP        → quan hệ TĨNH giữa hai dấu
     eventual consistency = ĐIỂM CUỐI   → một CHUYỂN ĐỘNG hoàn tất
   Khác loại vị từ thì khác hình dạng bằng chứng — không phải hai đèn bật/tắt.
   Beat 21 = "hai". monotonic reads KHÔNG dựng, KHÔNG đặt tên. */
build({
  id: 'ch4-bao-dam', dur: 18,
  note: '   CH-4 · hai bảo đảm. RYW là vị từ về MỘT CẶP, nên bằng chứng của nó là một quan hệ\n'
      + '   TĨNH giữa hai dấu — không gì chuyển động. EC là vị từ về ĐIỂM CUỐI, nên bằng chứng\n'
      + '   của nó là một CHUYỂN ĐỘNG hoàn tất — đầu mút dưới đi tới nơi. Hai loại bằng chứng\n'
      + '   khác nhau, nên không gộp được thành một thang bật/tắt.',
  body: BASE_BODY(),
  js: [
    "gsap.set('.pt, .pn', { opacity: 1 });",
    "gsap.set('#gapb', { opacity: 0 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "const sd = serve(499, 'down');",
    'gsap.set([W, Rd], { opacity: 0 });',
    'gsap.set(sd, { opacity: 0, scaleY: 0 });',
    '',
    '/* beat 20 — RYW có tên. Bằng chứng: một QUAN HỆ TĨNH giữa hai dấu của cùng người dùng.',
    '   Không vật nào chuyển động trong cửa sổ này. */',
    "tl.to([W, Rd], { opacity: 1, duration: .45, ease: R }, 0.6);",
    "tl.to(sd, { opacity: 1, scaleY: 1, duration: .5, ease: R }, 1.4);",
    "tl.to('#gapb', { opacity: .85, duration: .4, ease: R }, 2.4);",
    '',
    '/* beat 21 — EC vẫn được giữ đúng. Bằng chứng: một CHUYỂN ĐỘNG hoàn tất — đầu mút dưới',
    '   đi tới mọi vị trí đầu mút trên đã đạt. Khác LOẠI, nên khác hình dạng bằng chứng. */',
    "tl.to('#bRep', { scaleX: " + ((X(500) - G.x0) / (X(499) - G.x0)).toFixed(4)
      + ", duration: 1.5, ease: T }, 7.4);",
    "tl.to('#cRep', { x: " + (X(500) - X(499)) + ", duration: 1.5, ease: T }, 7.4);",
    "tl.to('#gapb', { opacity: 0, duration: .7, ease: T }, 7.8);",
    '',
    '/* beat 22-24 — không phải bug, là một cái giá. Trường trở lại đúng trạng thái đã trả:',
    '   tiền tố dưới lùi về 499, và khoảng chênh quay lại. Cái giá vẫn ở đó sau khi EC xong. */',
    "tl.to('#bRep', { scaleX: 1, duration: .9, ease: T }, 12.4);",
    "tl.to('#cRep', { x: 0, duration: .9, ease: T }, 12.4);",
    "tl.to('#gapb', { opacity: .85, duration: .5, ease: R }, 13.0);",
  ].join('\n'),
});

/* negative control cho R4: hai bảo đảm hiện ra như HAI ĐÈN cùng hình, chỉ khác trạng thái */
build({
  id: 'ch4-neg-binary', dur: 9,
  note: '   NEGATIVE CONTROL cho R4. Hai bảo đảm hiện ra như hai ĐÈN cùng hình, một bật một tắt —\n'
      + '   tức gộp hai loại vị từ vào một thang nhị phân, đúng thứ rejected_explanations[2] cấm.\n'
      + '   Bằng chứng của cả hai đều là một cú đổi opacity, không cái nào là chuyển động hoàn\n'
      + '   tất. Shot này TỒN TẠI ĐỂ TRƯỢT.',
  body: BASE_BODY() + `
    <div class="mk" id="d1" style="left:340px;top:1480px"></div>
    <div class="mk filled" id="d2" style="left:740px;top:1480px"></div>`,
  js: [
    "gsap.set('.pt, .pn', { opacity: 1 });",
    'const W = mark(500, true), Rd = mark(499, false);',
    "tl.to([W, Rd], { opacity: 1, duration: .3 }, 0.4);",
    "gsap.set(['#d1','#d2'], { opacity: 0 });",
    "tl.to('#d1', { opacity: 1, duration: .4 }, 2.0);",
    "tl.to('#d2', { opacity: 1, duration: .4 }, 6.0);",
  ].join('\n'),
});

/* ══════════════════ CH-5 · Câu hỏi (beat 39) ══════════════════════════════════
   CÚ RA TỈ LỆ. Rời thế giới, quay về người xem. Chữ, và chỉ chữ — đối xứng với CH-1. */
build({
  id: 'ch5-cau-hoi', dur: 8,
  note: '   CH-5 · câu hỏi. Cú ra tỉ lệ: rời lịch sử replication, quay về người xem.\n'
      + '   Chữ và chỉ chữ, đối xứng với CH-1 — mở bằng một sự cố, đóng bằng một câu hỏi.',
  css: `
.q { position: absolute; left: 90px; width: 900px; font-family: var(--font-label);
     font-size: 50px; line-height: 1.24; letter-spacing: .01em; font-weight: 600; }
#q1 { top: 980px; color: var(--ink); }
#q2 { top: 1130px; color: var(--stale); }`,
  body: `    <div class="q" id="q1">cái gì đang quyết định một câu SELECT đi về primary hay replica?</div>
    <div class="q" id="q2">và nó có biết gì về câu ghi vừa xảy ra không?</div>`,
  js: [
    "gsap.set(['#q1','#q2'], { opacity: 0 });",
    "tl.to('#q1', { opacity: 1, duration: .7, ease: R }, 0.6);",
    "tl.to('#q2', { opacity: 1, duration: .7, ease: R }, 3.4);",
  ].join('\n'),
});
