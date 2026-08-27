# H01 · Step 3 · R1 — kiểm câm phép chiếu

Nguồn: snapshot `f62837859b1d1a2f…` · provenance **CURRENT**.
Phạm vi: **câm**. Không voice, không polish, không chương, không đụng tooling replay.
Replay vẫn **NON-AUTHORITATIVE** — không có số nào từ replay xuất hiện trong tài liệu này.

Hai shot: `p-r1-projection` (ứng viên, 26s) · `p-r1-neg-slope` (negative control, 8s).
Gate sạch cả hai.

---

## PHÁN QUYẾT: **R1 TRƯỢT**

Và trượt theo cách có ích: nó phơi ra một mô hình tư duy sai mà **lập luận thiết kế của Step 2
không nhìn thấy**, bằng bằng chứng chứ không bằng tranh luận.

---

## Sáu câu hỏi

| | câu hỏi | kết quả | bằng chứng |
|---|---|---|---|
| **1** | người xem đọc ra *"cùng hai sự kiện, khác hệ quy chiếu"*? | **ĐẠT về hình học** | khớp mẫu 64×64 tại 6 mốc trong cửa sổ 11.0→25.5s: **lệch (0,0) ở cả 6 mốc, cả hai dấu**. Hai dấu không dịch một pixel nào trong khi hai hệ quy chiếu thay nhau |
| **2** | nó trông như hai biểu đồ không liên quan? | **KHÔNG — đạt** | trục không bao giờ đổi; chỉ có phép chiếu sáng lên rồi tắt. Đây là **một** trường, và điều đó đọc được |
| **3** | có vô tình hàm ý **TỐC ĐỘ** không? | **TRƯỢT** | độ dốc **đo trên khung hình**: primary −4.45, replica −0.19. Hai hình dạng nhìn thấy được khác nhau về dốc gần 25 lần |
| **4** | trường giải thích được gì khi nhãn không chở cơ chế? | **một nửa** | đoạn một-node (hai phép chiếu cùng thứ tự) đọc được. Nhưng đường chiếu **thẳng hàng** với đường node ở cả hai mức, nên không phân biệt được đâu là đường, đâu là phép chiếu |
| **5** | phép biến đổi giữ được thân phận khái niệm? | **ĐẠT** | dấu bất động + trục bất biến. Không có vật nào bị thay bằng vật khác |
| **6** | người xem tự đọc ra **CẢ HAI** phép chiếu từ độ lệch song song? | **TRƯỢT — quyết định** | không đọc được một độ lệch song song khi hai đường **vẽ đè lên nhau**. Đo được: **43% số cột của đường primary bị đường replica phủ** (417/736 cột còn nhìn thấy) |

---

## Mô hình tư duy sai đã phơi ra

> **Một phép tịnh tiến là VÔ HÌNH ở mọi chỗ mà thứ được tịnh tiến đang phẳng.**

Hai đường bậc thang chỉ khác nhau một cú dịch ngang thì các **đoạn phẳng của chúng nằm ở đúng
cùng một y**, nên trên màn hình chúng **trùng nhau**. Chỉ hai đoạn dốc là còn tách. Thứ render
ra không phải hai đường song song mà là **một hình bình hành khép kín**.

Xem ở độ phân giải gốc thì thấy rõ hơn cả số: đoạn ngang bên phải dấu commit **đổi từ trắng
sang xám** giữa chừng — đó là chỗ replica bắt đầu đè lên primary. Ở mức thấp, ba thứ khác nhau
cùng nằm trên một đường ngang: đoạn phẳng của primary, đoạn phẳng của replica, và đường chiếu
teal.

**Và đây là chỗ nó thành vi phạm ngữ nghĩa, không chỉ là lỗi thẩm mỹ:** hai mảnh còn nhìn thấy
được có độ dốc **−4.45** và **−0.19**. Một người xem chỉ thấy được hai mảnh đó sẽ đọc ra *"cái
xám phẳng hơn / chậm hơn"* — **đúng semantic lock A**, đi vào qua hình học, không qua một chữ
nào. `never_say` không thể bắt được điều này, và đó chính là lý do R8 phải là một phép đo.

### Lập luận mạnh nhất của Step 2 đã chết

Step 2 viết:

> *"độ lệch song song tự nó đã là phép chiếu đôi — dịch ngang đọc 'tới muộn hơn', dịch dọc đọc
> 'đang ở dưới'. Aha không cần thiết bị riêng."*

Artifact bác bỏ. Độ lệch **chỉ tồn tại nhìn thấy được ở đoạn dốc**, tức một dải x hẹp. Ở mọi
chỗ khác nó bằng không trên màn hình. Cú "hai cách đọc từ một cấu hình" là **có thật về mặt
toán học và vô hình về mặt thị giác**.

Điều này tổng quát hoá, nên đáng mang đi: **vẽ độ trễ thành một cú dịch chỉ đọc được ở nơi đại
lượng đang thay đổi.** Với một hệ phần lớn thời gian đứng yên giữa hai commit, đó là gần như
không ở đâu.

---

## Hai phép kiểm R8

```
✗  p-r1-projection  @8.6s
     độ dốc   primary -4.4451  replica -0.1860  |Δ| 4.2591 ≥ eps 0.02
     tịnh tiến khớp nhất dx=192px  residual 8.03px ≥ 2.0

✗  p-r1-neg-slope   @4.0s
     độ dốc   primary  0.0947  replica -0.0819  |Δ| 0.1766 ≥ eps 0.02
     tịnh tiến khớp nhất dx=425px  residual 13.40px ≥ 2.0
     ✓ negative control trượt đúng như thiết kế — bộ kiểm có nổ thật
```

**Negative control là phần quan trọng nhất của bảng này.** Nó xác nhận bộ kiểm thật sự bắt được
vi phạm R8, nên số của shot chính đáng tin. Một chặn chưa từng nổ thì chưa phải chặn.

**Ghi chú về dụng cụ, phải nói ra:** lần chạy đầu tôi đã ngờ bộ kiểm sai chứ không phải artifact
sai — độ dốc primary −4.44 trông như một con số hỏng. Chẩn đoán phân bố màu cho thấy ngược lại:
hai lớp tách sạch (`xám 160` / `xám 230`, vùng chết 181–215 gần rỗng), và primary chỉ còn
417/736 cột **vì bị vẽ đè**. Bộ kiểm đo đúng thứ có trên màn hình. Đã siết ngưỡng (>215 và
140–180) để bỏ hẳn vùng khử răng cưa, và kết quả không đổi.

Cần nói thêm: **phép đo độ dốc là phép YẾU ở đây.** Đường bậc thang phần lớn là đoạn phẳng, nên
độ dốc toàn cục của cả hai đều ≈ 0 và sẽ "đạt" một cách vô nghĩa; phải giới hạn vào đoạn dốc.
Phép **residual sau tịnh tiến** mới khớp đúng khẳng định (*"cùng một đường, dịch đi"*) và bắt
được cả những vi phạm mà độ dốc bỏ lọt. Cả hai đều đã chạy.

---

## Cái gì SỐNG SÓT

Không vứt hết. Ba thứ đã được chứng minh trên artifact và mang sang được:

1. **Dấu bất động qua đổi hệ quy chiếu là dựng được** — 0px ở 6 mốc. Cơ cấu "giữ thân phận"
   hoạt động; thứ hỏng là cái nền nó đứng trên.
2. **Một trường với trục bất biến không đọc ra thành hai biểu đồ.** Nỗi lo Q2 không xảy ra.
3. **Bộ kiểm R8 có kèm negative control** — dụng cụ này còn dùng được cho mọi biểu diễn sau,
   kể cả Lùi 1.

---

## Lùi 1 — bao hàm tiền tố

Theo đúng thứ tự đã khai ở `VISUAL_STRATEGY.md` §15. Không bảo vệ trường hai trục vì nó là thí
nghiệm chính của V2.1.

**Vì sao Lùi 1 miễn nhiễm với đúng lỗi vừa giết R1:** nó **không dùng độ dịch để mang nghĩa**.
Lịch sử là một đường vị trí duy nhất; mỗi node là một **đoạn bao** phủ tiền tố nó đã áp:

```
primary   [·························· 500 ]
replica   [······················ 499 ]          500 nằm NGOÀI
```

Hai đoạn bao **lồng nhau**, và quan hệ lồng nhau **nhìn thấy được ở mọi điểm**, không chỉ ở chỗ
đại lượng đang đổi. *"Sau"* thôi là chuyện thứ tự và thành chuyện **trong / ngoài một tiền tố** —
mà một câu đọc chỉ thấy được thứ nằm trong tiền tố của nó. `e1` (`replica ≤ primary`) trở thành
**một đoạn nằm trong một đoạn**, đọc trực tiếp hơn hai đường.

Và nó chở luôn R13 mà không cần thêm gì: **không có chỗ nào ngoài đoạn bao của primary** — vùng
bất khả trở thành *"ngoài tiền tố dài nhất tồn tại"*.

### Chi phí đã khai, và chỗ mới cho cặp không tách rời số 1

Lùi 1 **mất chiều đồng hồ**. Cặp beat 13–15 — *"độ trễ thường dưới một giây"* + *"khoảng giữa
lưu và câu đọc kế tiếp cũng dưới một giây"* + *"hai khoảng đó chồng lên nhau"* — là **hai khoảng
thời gian**, và đoạn bao không phải chỗ để đặt chúng. Đặt hai khoảng thời gian lên trục vị trí
là nói dối.

Ba chỗ khả dĩ, xếp theo thứ tự tôi sẽ thử:

1. **Một thiết bị thời gian nhỏ, riêng, chỉ sống ở beat 13–15 rồi nghỉ.** Trung thực và rẻ.
   Cái giá: đúng là *"thêm một lớp bên cạnh thế giới"* — hạn chế đã biết của G01. Khai thẳng
   thay vì giả vờ không có.
2. **Trường hai trục dùng ĐÚNG ở chỗ nó hoạt động.** R1 vừa chứng minh độ lệch **đọc được ở
   đoạn dốc** — và beat 13–15 là beat duy nhất mà đại lượng thật sự đang đổi. Dùng trường hai
   trục cho riêng ba beat đó, rồi giao phần thứ tự cho đoạn bao. Cái giá: hai thế giới, và
   phải chứng minh được cú chuyển giữa chúng giữ thân phận — tức lại là một câu hỏi R1 nữa.
3. **Bề rộng của khe hở giữa hai đoạn bao.** Khoảng cách `500 − 499` là bề rộng cửa sổ tính
   theo vị trí; khoảng round trip thì không. Chưa thấy cách nào đặt cạnh nhau mà không biến vị
   trí thành thời gian. **Nhiều khả năng loại**, ghi lại để không thử lại.

**Chưa chọn.** Đây là câu hỏi đầu tiên phải trả lời trước khi dựng Lùi 1, không phải thứ để
phát hiện giữa chừng.

### Escalate

Chỉ **sau khi** Lùi 1 cũng trượt mới xin Content Agent một điểm tựa bằng lời. Không xin phòng ngừa.

---

## Kết quả này là THÀNH CÔNG của R&D

Một prototype bị loại vì phơi ra được một mô hình tư duy sai đáng giá hơn một prototype đạt vì
chưa ai hỏi đúng câu. Ba thứ thu được:

- một **luật tổng quát** — *độ dịch chỉ đọc được ở nơi đại lượng đang đổi* — áp cho mọi lần
  định vẽ "trễ" thành "lệch" về sau;
- bằng chứng rằng **lập luận thiết kế nghe hay vẫn có thể sai**, và chỉ artifact mới phân xử
  được: cú "một cấu hình, hai cách đọc" đúng về toán và vô hình về thị giác;
- một dụng cụ (`check-parallel-lines.mjs`) **có negative control**, dùng lại được cho Lùi 1.

---

# CỔNG CHẶN — chỗ cho cặp không tách rời số 1

**CHỌN: ứng viên (1)**, ở dạng đã đổi khung — một thiết bị thời gian riêng cho beat 13–15,
**dùng lại đúng quan hệ BAO HÀM** của thế giới Lùi 1 chứ không phải một ngữ pháp lạ.

## Vì sao — đọc lại chính nội dung của cặp

```
beat 13  độ trễ replication:        thường dưới một giây
beat 14  khoảng lưu → câu đọc kế:   cũng dưới một giây
beat 15  hai khoảng đó CHỒNG lên nhau. Đó là toàn bộ lỗi.
```

Hai khoảng **xuất phát từ cùng một mốc** (lúc commit). A = commit → replica áp xong 500.
B = commit → trình duyệt gửi câu đọc kế. Lỗi xảy ra khi **B kết thúc BÊN TRONG A**.

Đó là một sự kiện **một chiều**, và quan hệ của nó là **trong / ngoài** — **đúng quan hệ mà
Lùi 1 đã dùng cho phần còn lại của video**. Không phải một ngữ pháp thứ hai: cùng một phép,
áp lên một tập khác. *"Câu đọc rơi vào trong cửa sổ"* và *"vị trí 500 nằm ngoài tiền tố"* là
hai câu cùng dạng.

## Vì sao loại (2) — dù giả thuyết của reviewer đứng vững ở ba câu §3

Ba câu §3 của V2.1, trả lời thẳng cho (2) (mở lại trường hai trục ở 13–15):

1. **Thân phận nào giữ?** Đầu mút đoạn bao chính là vị trí hiện tại của node, nên đường trong
   trường hai trục là **vết của đầu mút đó theo thời gian**. Có quan hệ thân phận thật.
2. **Thuộc tính nào đổi?** Từ *"biên đang ở đâu"* sang *"biên tới đó lúc nào"*.
3. **Biểu diễn mới giải thích được gì?** Đúng thứ cặp 1 cần: **hai khoảng thời gian và chỗ
   chồng nhau**. Thế giới bao hàm không có thời gian nên tự nó không nói được điều đó.

**Ba câu đều trả lời được. Vẫn loại.** Hai lý do, không lý do nào là thẩm mỹ:

- **Sai dụng cụ cho sự kiện.** Cặp 1 là một sự kiện **một chiều** — hai khoảng chung gốc, và
  một cái kết thúc bên trong cái kia. Mở một trường **hai chiều** để chở một sự thật một chiều
  là với tay lấy thiết bị chứ không phải khớp thiết bị với khẳng định. Tiêu chuẩn review:
  **không thưởng cho độ phức tạp.**
- **Phải chứng minh thêm một biến đổi L3 để phục vụ ba beat.** Cú *đoạn-bao → vết* là một
  biến đổi mức 3 nữa, và nó phải qua đúng loại kiểm câm vừa giết R1. Chi phí đó không tương
  xứng với ba beat, và nó **mở lại đúng hình học vừa bị loại** — kể cả khi chỉ mở ở chỗ đã đo
  là có hiệu lực.

## Vì sao loại (3)

Đã tự xếp loại ở lượt trước và ghi lại để không thử lại: đặt hai khoảng **thời gian** lên trục
**vị trí** là nói dối. Không mở lại.

## Chi phí còn lại của (1), khai trước

Beat 13–15 vẫn cần một trục thời gian mà phần còn lại của Lùi 1 không có. Đó vẫn là *"thêm một
thiết bị"* — hạn chế #1 của G01. Cái được là **quan hệ thì không đổi**: người xem không phải học
một phép đọc thứ hai, chỉ phải áp phép đọc đã biết lên một tập khác. Điều này **chưa được kiểm**;
nó là câu hỏi đầu tiên của lần prototype sau, không phải kết luận của lần này.
