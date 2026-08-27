# H01 · Step 3 · prototype CUỐI — cú đổi cách nhìn trong thế giới bao hàm

Nguồn `f62837859b1d1a2f…` · provenance **CURRENT**. Câm. Replay **NON-AUTHORITATIVE**.
Khai trước: `STEP3_SWEEP_PREDECLARATION.md` — viết xong **trước khi sinh shot đầu tiên**.
Hai shot, gate sạch: `p-sw-order` (28s) · `p-sw-neg-tempo` (32s, negative control).

---

## PHÁN QUYẾT: **TRƯỢT**

Nền giữ được **tất cả** những gì Lùi 1 đã đạt. Cú đổi cách nhìn thì **không thành hệ quả** — nó
là **tiếng vọng**, và điều đó giờ được **đo**, không còn là dự đoán.

---

## Số đo quyết định

Bốn lần nổ vòng sáng, hai lượt. So các khung **cùng chứa một vòng sáng** nhưng thuộc **hai lượt
khác nhau**:

```
khung 14.2s (lượt TỚI, nổ ở 499)  vs  18.2s (lượt VỊ TRÍ, nổ ở 499)   YAVG 0.0038  YMAX 9
khung 12.2s (lượt TỚI, nổ ở 500)  vs  20.2s (lượt VỊ TRÍ, nổ ở 500)   YAVG 0.0039  YMAX 8
```

> **Hai lượt duyệt chỉ sinh ra HAI bức ảnh, mỗi bức xuất hiện đúng hai lần.**

Toàn bộ thông tin của *"hai thứ tự"* nằm ở **trình tự xuất hiện của hai bức ảnh đó** — và ở
**không gì khác**. Không có một token nào trong khung phân biệt lượt nào là lượt nào.

Nên người xem phải: giữ một chuỗi bốn sự kiện trong trí nhớ suốt ~8 giây, nhận ra nó đối xứng,
**rồi** lấy từ **lời** cái nhãn cho mỗi nửa. Đúng định nghĩa tiếng vọng ở R17.

---

## Sáu câu — không kế thừa gì từ Lùi 1

| | câu | kết quả | số đo |
|---|---|---|---|
| **1** | *"cùng hai sự kiện, khác cách nhìn"*? | **TRƯỢT — dứt điểm** | dấu bất động **(0,0) ở 7 mốc** cả hai dấu ✓ nhưng hai *"cách nhìn"* cho ra **khung gần như trùng khít** (YAVG 0.0038 / 0.0039). Không có **cách nhìn** nào khác — chỉ có **thứ tự** khác của cùng hai cách nhìn |
| **2** | hai vật không liên quan? | **KHÔNG — đạt** | một đường lịch sử, hai đoạn bao trên nó, hai dấu trên đường |
| **3** | hàm ý **tốc độ**? | **ĐẠT** | chuyển động chỉ ở các cụm rời rạc; **không lúc nào hai vật cùng động ở hai nhịp**. Không vật nào **di chuyển** trong hai lượt — chỉ vòng sáng nở tại chỗ |
| **4** | tự giải thích khi nhãn không chở cơ chế? | **ĐẠT — kiểm lại trên artifact này** | bốn khung xem xét đều cắt ở y 900–1180, tức **đã loại cả hai nhãn** (`lPri` 856, `lRep` 1212). Hai đầu mút và hai dấu vẫn đọc được |
| **5** | giữ thân phận qua phép biến đổi? | **KHÔNG ÁP DỤNG** | vẫn không có phép biến đổi nào — và lần này có số: khung **trùng khít**, nên không có gì để thân phận sống sót qua. Ghi "không áp dụng", **không** ghi "đạt" |
| **6** | bao hàm đọc được ở **mọi** điểm? | **ĐẠT** | đầu mút riêng: primary **x=802**, replica **x=617**, cách **185px** |

**R15 · ĐẠT** — `trong(799≤802)` ở **5/5** mốc trải suốt cả hai lượt (8.5 · 11.5 · 14.5 · 17.5 ·
20.5s). Negative control `p-l1-neg-uncovered` vẫn nổ.

**Xác nhận nền còn nguyên sau khi thêm sự kiện:** Q3 ✓ · Q4 ✓ · Q6 ✓ · R15 ✓.

---

## R16 — và negative control

```
p-sw-order       theo thứ tự tới      nổ 12.05s → 14.05s   khoảng 2.000s
                 theo thứ tự vị trí   nổ 18.05s → 20.05s   khoảng 2.000s
                 |Δ| = 0.000s < eps 0.15   ✓ không có nhịp nào để so

p-sw-neg-tempo   lượt một             khoảng 2.000s
                 lượt hai             khoảng 4.000s
                 |Δ| = 2.000s ≥ eps 0.15   ✓ negative control trượt đúng
```

R16 **đạt theo cấu tạo**, không theo chỉnh tay: cả hai lượt dùng **cùng một hằng số** `GAP`
trong generator. Và phép đo còn tự khôi phục được **thứ tự** của từng lượt (500→499 rồi
499→500) mà không đọc source — tức cú đảo **có thật trên artifact**.

---

## R17 — trả lời sau khi đo

**(a) Tất yếu hay minh hoạ?** Đã khai trước: **hướng** tất yếu (R nằm trái W nên duyệt theo thứ
tự tới buộc phải chạy ngược), **cú duyệt** thì không — thế giới không tự sinh ra nó. Số đo
không đổi kết luận này và làm nó nặng hơn: vì hai lượt cho **cùng hai bức ảnh**, cú duyệt không
để lại **dấu vết nào** trong hình học, chỉ để lại một trình tự.

**(b) L3 hay đổi tiêu điểm?** Đã khai trước: **đổi tiêu điểm**. Xác nhận bằng số — biểu diễn
không đổi một pixel nào giữa hai lượt.

**(c) Vấn đề cấu trúc đã khai trước — và nó đúng.** Lượt *theo vị trí* tự neo được vào đường
lịch sử (trái→phải là hướng của log). Lượt *theo thứ tự tới* **không neo được vào gì**, vì thế
giới bao hàm **cố ý không có trục thời gian** — đó chính là thứ nó đánh đổi để đạt Q3/Q4/Q6.

**Dự đoán trước khi dựng là ĐÚNG.** Ghi lại điều đó ở đây, và ghi luôn rằng nó **không** khiến
việc dựng thành thừa: R1 đã dạy rằng lập luận thiết kế nghe hay vẫn có thể sai, và điều đó đối
xứng. Không có artifact thì "tiếng vọng" vẫn chỉ là một ý kiến; giờ nó là **YAVG 0.0038**.

---

## §4 — khuyết tật `--stale` đã SỬA

Dải khe hở tô `--stale` phủ nửa trái dấu ở 500 — màu báo động đặt lên đúng **giá trị đã commit
đúng**, thứ duy nhất trong khung không có vấn đề gì. Cùng họ với *"false witness"* của G01, đổi
từ tầng nhãn sang **tầng palette**.

Sửa: khe hở thành **một vạch 3px trung tính** (`--ink-dim`), đặt **dưới đường** ở `yLine + 20`,
tức nằm ngoài bán kính của mọi dấu. Đo trên artifact tại `x 640–840, y 1020–1026`: **`363a3b`**
— trung tính, không có kênh đỏ trội. `--stale` (`e0533d`) không còn xuất hiện ở đâu gần dấu.

Đã áp cho **cả** `p-l1-prefix` (render lại) và `p-sw-order`. Không mang khuyết tật này sang bản
dựng chương.

---

## Kết luận theo §6

Ba prototype đã thử. Không có lần thứ tư, và điểm tựa bằng lời **đã tồn tại** nên không escalate.

> **Cú đảo của 007 sống trong NARRATION.**
> Beat 17–18 là một cặp song song hoàn chỉnh: cùng chủ thể, hai mệnh đề hệ quy chiếu nêu thẳng,
> hai từ thứ tự đối nhau. Lời **tự thực hiện** cú đổi hệ quy chiếu.
>
> **Hình chở THẾ GIỚI BAO HÀM TRUNG THỰC làm nền** — và cái nền đó đã được đo sạch ở bốn tiêu
> chí: không hàm ý tốc độ · tự giải thích không cần nhãn · quan hệ đọc được ở mọi điểm · giá trị
> đã commit không bao giờ rời khỏi tiền tố phủ nó.
>
> **007 KHÔNG ĐỠ ĐƯỢC một biến đổi L3 cho cú aha của nó**, và lý do là cấu trúc chứ không phải
> thi công: cú đảo cần **hai hệ quy chiếu cùng hiện diện**, mà mọi biểu diễn trung thực của chủ
> đề này chỉ mang được **một** — hoặc trục vị trí (bao hàm), hoặc trục thời gian, không cùng lúc
> mà không nói dối. R1 thử mang cả hai và hình học sụp (LAW-1). Lùi 1 chọn một và mất loại vị từ
> (LAW-2). Cú duyệt thử vay hệ quy chiếu thứ hai từ **trình tự**, và trình tự không để lại dấu
> vết trong khung.

Doctrine V2.1 nói thẳng: **không ép L3 ở mọi chỗ.** Đây là một kết quả V2.1 **hợp lệ**.

Ba lượt đổi lấy **hai định luật ngữ pháp hình** (LAW-1, LAW-2), **một cổng thủ tục** cho phép đo,
**bốn dụng cụ có negative control**, và **một nền đã kiểm sạch** để dựng chương lên. Một kết
luận *"chủ đề này không đỡ được L3"* có giá trị hơn một L3 ép vào.

---

## Đề xuất phạm vi bản dựng chương đầu tiên — CHƯA THỰC HIỆN

Không tự mở. Nêu để reviewer quyết.

1. **Thế giới bền = thế giới bao hàm của Lùi 1**, giữ nguyên bốn tính chất đã đo sạch. Nó chở
   được beat 8–12, 20–24, và phần lớn 25–33.
2. **Cú đảo (beat 16–19) do lời dẫn**, hình **không diễn lại** nó. Việc của hình ở ba beat đó là
   **giữ hai dấu đứng yên và cho thấy quan hệ bao hàm** — tức chở nửa mà nó chở được (*"trước
   theo vị trí log"* = *"tiền tố của nó không chứa 500"*), và không giả vờ chở nửa kia.
3. **Cặp không tách rời số 1 (beat 13–15)**: thiết bị thời gian riêng, dùng lại quan hệ **bao
   hàm** — *B kết thúc bên trong A*. Đã chốt ở cổng chặn lượt trước.
4. **Bốn vị trí (beat 25–33)**: bốn phép biến hình khác loại trên cùng trường, tỉ lệ **giữ
   nguyên** suốt đoạn (§9 thắng §7, đã duyệt). R14 áp dụng khi dựng V4.
5. **Không neo timing vào 169s.** Giọng thật F01 cho 4.0–4.7 âm tiết/giây ⇒ 711 âm tiết nằm
   trong **~151s–~178s**. Chờ đo giọng thật rồi mới khoá thời lượng chương.
6. **Chưa xét camera.** Ứng viên duy nhất (R3→R4) gắn với cú đổi hệ quy chiếu, mà cú đó giờ do
   lời dẫn — nên nhiều khả năng **không còn ứng viên nào**, và mặc định tĩnh sẽ phải có lý do
   chứ không được là mặc định câm.
