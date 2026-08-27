# H01 · Step 3 · prototype cuối — KHAI TRƯỚC KHI DỰNG

Bắt buộc theo §5. Viết xong mới sinh shot đầu tiên. Không sửa sau khi có số đo.

---

## R17 · (a) Cú đảo là TẤT YẾU hay chỉ ĐƯỢC MINH HOẠ?

### Đã thử tìm bản "tất yếu" — và tìm ra vì sao không có

Bản mạnh nhất có thể có: để **chính vật trong thế giới** thực hiện cú duyệt, thay vì một con
trỏ do tôi thêm vào.

- **Lượt duyệt theo thứ tự vị trí** có ứng viên thật: *đoạn bao lớn lên*. Áp log **là** đi từ
  trái sang phải, nên nó không phải thiết bị thêm vào.
- Nhưng vị trí là **rời rạc**, và đoạn bao đang dừng ở 499. Để phủ 500 nó bước **đúng một
  bước**. Một bước không phải một **cặp có thứ tự** — nên đoạn bao **không duyệt được hai dấu**.

Kết luận: lượt duyệt theo vị trí **buộc phải là con trỏ**. Và nếu một lượt là con trỏ thì lượt
kia cũng phải là con trỏ, nếu không hai lượt không so được (R16).

**Trả lời:** **hướng** của mỗi lượt là **tất yếu** — R nằm trái W, nên duyệt theo thứ tự tới
buộc phải chạy ngược, không có lựa chọn nào khác. Nhưng **bản thân cú duyệt thì không tất yếu**:
thế giới không tự sinh ra nó. So với R1, ở đó phép chiếu là một **phép toán trên toạ độ đã có**;
ở đây cú duyệt là một **thiết bị được thêm**.

### (b) L3 hay ĐỔI TIÊU ĐIỂM?

**ĐỔI TIÊU ĐIỂM. Không phải L3.** Nói thẳng theo §5.

Biểu diễn **không đổi một nét**: vẫn đường lịch sử, vẫn hai đoạn bao, vẫn hai dấu, vẫn cùng
toạ độ. Thứ đổi là **thứ tự chú ý**. Đó đúng định nghĩa tiêu điểm, và doctrine V2.1 xếp nó ở
**mức 1–2**, không phải mức 3.

### Và một vấn đề cấu trúc phải khai trước, vì nó nặng hơn cả hai câu trên

**Lượt duyệt theo vị trí TỰ NEO được. Lượt duyệt theo thứ tự tới thì KHÔNG.**

- Thứ tự vị trí có sẵn một vật mang nó: **đường lịch sử**, chạy trái→phải. Rings nổ trái→phải là
  đọc theo đường. Tự neo.
- Thứ tự **tới** cần một trục thời gian — và **thế giới bao hàm cố ý không có trục nào như vậy**
  (đó chính là cái nó đánh đổi để đạt Q3/Q4/Q6). Trong khung không có vật nào nói *"lượt này là
  đồng hồ"*.

Nên cú duyệt **giỏi lắm chỉ neo được một nửa**, và nửa còn lại phải do **lời** cấp — tức đúng
định nghĩa **tiếng vọng** ở R17.

**Dự đoán của tôi trước khi dựng: R17 TRƯỢT, vì lý do cấu trúc chứ không vì dựng kém.**

Vẫn dựng. R1 đã dạy rằng một lập luận thiết kế nghe hay vẫn có thể sai — và điều đó **đối xứng**:
một lập luận rằng thứ gì đó *sẽ không chạy* cũng có thể sai. Dự đoán không phải bằng chứng. Khai
ra ở đây để nếu số đo bác nó thì tôi không thể lặng lẽ đổi lập luận.

---

## R16 · duyệt tái sinh tốc độ

**Rủi ro:** hai lượt duyệt là chuyển động **có nhịp**. Hai nhịp khác nhau ⇒ lock A quay lại qua
**tempo** thay vì qua độ dốc, và `never_say` vẫn không bắt được.

**Luật dựng:** không có vật nào **di chuyển**. Mỗi lượt chỉ là **hai vòng sáng nổ lần lượt** trên
hai dấu đứng yên. Không con trỏ trượt, nên không có vận tốc nào để so. Thứ duy nhất còn mang
nhịp là **khoảng cách giữa hai lần nổ**, và luật là:

> Khoảng giữa hai lần nổ phải **BẰNG NHAU** ở cả hai lượt, cùng hàm easing.

**Negative control:** `p-sw-neg-tempo`, dựng cố ý lượt thứ hai giãn gấp đôi. Bộ kiểm phải nổ.

---

## Ba dòng cổng L2 — khai cho từng phép đo, trước khi chạy

### Đo 1 · tempo hai lượt (R16)
1. **Khẳng định:** hai lượt duyệt không cho phép so nhịp — khoảng giữa hai lần nổ bằng nhau.
2. **Đại lượng đo:** thời điểm khung đầu tiên mà ô 70×70 quanh **mỗi dấu** đổi so với nền của
   chính cửa sổ lượt đó; lấy hiệu hai thời điểm trong mỗi lượt.
3. **Vì sao KHÔNG phải thay thế:** khẳng định nói về *khoảng giữa hai lần nổ*, và đây đo **đúng
   khoảng đó** trên artifact. Không suy từ tham số animation trong source (source có thể đúng mà
   render sai), không suy từ tổng thời lượng lượt (một lượt có thể dài hơn mà khoảng vẫn bằng).

### Đo 2 · dấu bất động (Q1/Q5)
1. **Khẳng định:** hai dấu không dịch một pixel nào trong suốt cả hai lượt.
2. **Đại lượng đo:** khớp mẫu 64×64 quanh mỗi dấu, tìm độ lệch khớp nhất trong ±20px.
3. **Vì sao KHÔNG phải thay thế:** đo trực tiếp **vị trí** của chính vật được khẳng định. Không
   đo mực, không đo bao lồi — hai thứ đó có thể không đổi trong khi vật dịch.

### Đo 3 · đầu mút riêng (Q6) — dùng lại `check-prefix-containment.mjs` A
1. **Khẳng định:** mỗi tiền tố có một đầu mút quan sát được; không cái nào che cái nào.
2. **Đại lượng đo:** cột phải nhất của thanh `--ink-mid` ở **mức riêng của từng đoạn bao**.
3. **Vì sao KHÔNG phải thay thế:** đầu mút **chính là** thứ mất đi khi hai thanh chồng mức —
   không phải một dấu hiệu của việc đó. *(Bản đầu đo giao **chỉ số cột**, và đó **là** một thay
   thế: hai thanh ở hai mức khác nhau đương nhiên dùng chung cột x.)*

### Đo 4 · R15 — dùng lại `check-prefix-containment.mjs` B
1. **Khẳng định:** dấu ở 500 luôn có mặt và **tâm** của nó nằm trong đoạn bao của primary.
2. **Đại lượng đo:** tâm cụm `--ink` phải nhất trên đường lịch sử, so với cột phải nhất của
   thanh primary.
3. **Vì sao KHÔNG phải thay thế:** *"nằm trong tiền tố"* là quan hệ giữa **vị trí** và **đầu
   mút**, và tâm là điểm đại diện cho vị trí. *(Bản đầu dùng **mép phải** của một đĩa **đặt
   giữa** vị trí — hai điểm không cùng loại.)*

### Đo 5 · không hàm ý tốc độ (Q3)
1. **Khẳng định:** không lúc nào hai vật cùng chuyển động ở hai nhịp khác nhau.
2. **Đại lượng đo:** mật độ khung có đổi (4fps, `tblend`), và kiểm rằng không có hai khoảng
   chuyển động **chồng nhau** thuộc hai vật khác nhau.
3. **Vì sao KHÔNG phải thay thế:** khẳng định là về **đồng thời + khác nhịp**; đếm tổng chuyển
   động sẽ là thay thế, nên phải xét **chồng nhau**, không xét tổng.

---

## Neo timing

**Không neo bất cứ thứ gì vào 169s.** Giọng thật ở F01 cho 4.0–4.7 âm tiết/giây, nên 711 âm tiết
của 007 nằm trong khoảng **~151s–~178s**. Con số trong package là số **dẫn xuất**, không phải sự
thật sản xuất. Prototype này đặt thời lượng theo nhu cầu kiểm, không theo beat.
