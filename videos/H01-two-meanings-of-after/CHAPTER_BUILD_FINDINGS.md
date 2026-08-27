# H01 — dựng chương, CÂM

Nguồn `f62837859b1d1a2f…` · provenance **CURRENT**. Câm. Không voice, không polish, không
voiced review, không freeze. Replay **NON-AUTHORITATIVE**.

Sáu shot, **gate sạch 6/6**: ba chương + ba negative control.

---

## Thứ tự dựng, và lý do xếp

Không theo thứ tự trong prompt (A · B · C). Xếp theo **bán kính vô hiệu hoá** — chương nào
trượt thì làm hỏng nhiều việc khác nhất, chương đó dựng trước:

| | chương | nếu trượt thì hỏng gì | thứ tự |
|---|---|---|---|
| **B** | AHA (16–19) | quan hệ giữa **thế giới và lời** sụp. A và C đều đứng trên cùng thế giới đó, nên cả hai thành vô nghĩa | **1** |
| **A** | bốn vị trí (25–33) | chương dài nhất phải dựng lại. Đắt, nhưng **cục bộ** — thế giới vẫn đứng | **2** |
| **C** | phát hiện (34–38) | một chương phải dựng lại | **3** |

B trước vì R18 hỏi một câu về **nền**: hình có được phép phát biểu hệ quy chiếu của nó khi lời
đang nói theo hệ khác không. Câu đó không trả lời được thì A và C xây trên cát.

---

## CH-B · AHA (beat 16–19) — 15s

### Khai §4 của V2.1

| | |
|---|---|
| **BỀN** | đường lịch sử · bốn vạch vị trí · hai dấu quan sát |
| **đổi TRẠNG THÁI** | dấu W và R xuất hiện, theo thứ tự tới |
| **đổi CẤU TRÚC** | hai đoạn bao **tới** ở beat 18, rồi tiền tố thứ hai **biến mất** ở beat 19 và trở lại |
| **đổi BIỂU DIỄN** | không có. Đã đo ở Step 3: chủ đề này không đỡ được L3 cho cú đảo |
| **CHỖ TRỐNG** | phía phải đầu mút một tiền tố = phần lịch sử node đó **chưa áp**. Vùng ngoài tiền tố dài nhất = **bất khả** (R13) |
| **CAMERA** | tĩnh — cú đổi hệ quy chiếu do **lời** dẫn, nên không có gì để camera hé lộ |

### R18 — xử bằng IM LẶNG ĐÚNG LÚC, không bằng nhãn

Cách xử: **hệ quy chiếu của hình đến cùng mệnh đề gọi tên nó.**

- **beat 17** (*"…nếu đo bằng đồng hồ"*): **không đoạn bao nào trên màn hình.** Hình không phát
  biểu hệ nào cả, nên không có gì để người xem gán nhầm.
- **beat 18** (*"…nếu đo bằng vị trí trong log"*): đoạn bao **tới đúng lúc đó**. Hệ vị trí xuất
  hiện cùng mệnh đề gọi tên nó.

**Kiểm câm, đo trên artifact:**

```
trong cửa sổ 2.9–5.6s:  2.9s:0px  3.57s:0px  4.25s:0px  4.92s:0px  5.6s:0px
sau cửa sổ (7.0s):      4360px                        → IM LẶNG ĐÚNG LÚC
negative control (đoạn bao có mặt từ đầu): 4360px ở cả 5 mốc → nổ đúng
```

### beat 19 — *"với một node, hai cách đo là một"*

Tiền tố thứ hai **biến mất**, và cùng với nó là **chính khả năng phát biểu** chuyện loại trừ:
tiền tố duy nhất còn lại chứa cả hai dấu. Rồi node thứ hai trở lại và loại trừ phát biểu được
lại. `edge_cases[0]` (*"chỉ một node: không tồn tại"*) trở thành một **công tắc**, không phải
một câu.

### Nền còn nguyên

`A đầu mút riêng` primary **x=802** · replica **x=617** · cách **185px** →
**HAI ĐẦU MÚT QUAN SÁT ĐƯỢC**. `B R15` `trong(799≤802)` **5/5** mốc.

---

## CH-A · bốn vị trí (beat 25–33) — 30s

### Khai §4 của V2.1

| | |
|---|---|
| **BỀN** | đường lịch sử · hai đoạn bao · dấu commit ở 500 |
| **đổi TRẠNG THÁI** | câu đọc xuất hiện / biến mất; đầu mút tiền tố dưới tiến rồi trả về |
| **đổi CẤU TRÚC** | trường đi từ mang **một** cấu hình sang mang **bốn**; mỗi phép chạm vào một **vật khác nhau** |
| **đổi BIỂU DIỄN** | không có, và **cố ý** — bốn vị trí phải so sánh được |
| **CHỖ TRỐNG** | khe hở giữa hai đầu mút = phần log replica **chưa áp**; nó đóng ở V2/V3, **không đổi** ở V4 |
| **CAMERA** | tĩnh — bốn vị trí phải cùng **một chỗ đứng** thì mới ngang hàng |

### Bốn phép biến hình KHÁC LOẠI

| | phép | chạm vào | mua | trả |
|---|---|---|---|---|
| **V1** | **NỐI LẠI** — sợi phục vụ của chính câu đọc đó chuyển lên tiền tố primary | *câu đọc* | dấu đó thấy được 500 | beat 27: **chỉ đúng câu đọc đó**. Câu đọc khác vẫn nối xuống — tri thức "câu nào cần" nằm ngoài hệ thống |
| **V2** | **CHỜ** — tiền tố dưới đi tới 500 **trước**, câu đọc mới xảy ra | *lúc đọc* | mọi câu đọc được nối lại đều đúng | câu đọc **phải chờ** |
| **V3** | **NEO** — đầu mút dấu commit neo vào **điều kiện** "tiền tố dưới chạm 500" | *dấu commit* | phủ mọi câu đọc | commit trễ hơn hẳn |
| **V4** | **KHÔNG VẼ** — không câu đọc nào chạm tiền tố dưới | *cái người dùng thấy* | triệu chứng biến mất | **trường KHÔNG ĐỔI MỘT NÉT** |

Bốn phép khác **loại**, không khác **cỡ**: nối lại · chờ · neo · không vẽ. Ngang hàng là hệ quả
của **hình học khác nhau**. Tỉ lệ **giữ nguyên suốt 30s** — §9 thắng §7, đã duyệt.

### R14 — kiểm câm bằng DỰ ĐOÁN, đo trên artifact

Beat 33 đưa vào **câu đọc thứ hai** (*"tab thứ hai vẫn thấy giá trị cũ"*), và nó nối **xuống**:

```
sợi phục vụ: trên 0px · dưới 364px → replica  ·  đầu mút tiền tố dưới x=617
→ VẤN ĐỀ CÒN NGUYÊN
negative control (sợi nối LÊN primary): trên 202px · dưới 4px → HÌNH NÓI ĐÃ SỬA ĐƯỢC → nổ đúng
```

Không nhãn chữ nào tham gia. Cặp không tách rời số 3 thành **hai sự kiện trên một trường**.

### R11 — nửa availability CỐ Ý KHÔNG DỰNG

Sợi neo chở được **độ trễ**: đầu mút commit neo vào một **điều kiện**, không vào một thời điểm.
Nửa **availability** (*"replica chết thì đường ghi đứng theo"*) **không dựng**, và không phải vì
quên:

Package nói đúng một câu, hai lần, bằng cùng một từ — **"đứng"**. Không có chữ nào về timeout /
thất bại / hết giờ. Vẽ một đường biên timeout là **mượn từ ngoài package**, và tệ hơn, nó đổi
khẳng định: một câu ghi *đứng* và một câu ghi *thất bại* có hậu quả khác nhau với bên gọi.

**R11 giữ nguyên "chưa đủ".** Không vá.

---

## CH-C · phát hiện (beat 34–38) — 22s

### Khai §4 của V2.1

| | |
|---|---|
| **BỀN** | đường lịch sử · hai đoạn bao · dấu commit |
| **đổi TRẠNG THÁI** | ba mốc xuất hiện lần lượt; hai mốc đầu **mờ đi** khi mốc thứ ba nối được vào đầu mút |
| **đổi CẤU TRÚC** | một **hành trình** dọc xuất hiện, nối dấu commit với đầu mút tiền tố dưới |
| **đổi BIỂU DIỄN** | không có |
| **CHỖ TRỐNG** | khe hở = **số đọc**. Nó **trống** ở cả hai thế giới, và đó chính là bài học: đo được bề rộng một vùng trống không cho biết có ai đứng trong đó |
| **CAMERA** | tĩnh — dụng cụ đo không cần đổi chỗ đứng |

### R6 — ba MỐC trên MỘT hành trình

`write_lag` · `flush_lag` · `replay_lag` xuất hiện **lần lượt** dọc **một** đường đi xuống, và
**chỉ mốc thứ ba có sợi nối tới đầu mút tiền tố** — vì chỉ *applied* mới dời được đầu mút đó.
Hai mốc đầu mờ đi: chúng nói về **độ bền**, không nói về **khả năng nhìn thấy**.

Không phải ba thanh ngang nhau, nên không dạy được *"ba chỉ số thay nhau, chọn cái tốt nhất"*.

### R12 — cùng số đọc, hai thế giới

```
khe hở (a) 185px · (b) 185px   |Δ| 0px    → CÙNG SỐ ĐỌC
đầu mút dịch trong 1s: (a) 86px · (b) 0px  → HAI THẾ GIỚI KHÁC HẲN
negative control (khe hở đổi bề rộng): 266px vs 185px, |Δ| 81px → nổ đúng
```

Thế giới (a): hai đầu mút **cùng tiến**, khe hở giữ nguyên — busy, replica theo kịp.
Thế giới (b): **không gì tiến**, khe hở y hệt — primary rảnh, *không có gì để chép*.

**Cùng một con số nhỏ, hai tình huống khác hẳn.** `signal ≠ diagnosis`, phát biểu bằng hình.

---

## R10 — khai lại cho THẾ GIỚI BAO HÀM. Con số thật: **một**

Thang bảy nấc ở Step 2 gắn với trường hai trục, thứ đã chết. Không còn hiệu lực.

Đếm lại trung thực cho thế giới bao hàm:

| chuyển | có phải đổi **tỉ lệ** không? |
|---|---|
| trải nghiệm người dùng → đường lịch sử | **CÓ** — từ một giá trị trong giao diện sang một lịch sử replication |
| hai dấu → hai đoạn bao | không. Cùng phạm vi, **thêm vật** |
| một cấu hình → bốn quỹ đạo | không. Cùng phạm vi, **thêm cấu trúc** — và §9 **cấm** đổi tỉ lệ ở đây |
| trường → dụng cụ đo | không. Cùng phạm vi, **thêm hành trình dọc** |
| đường lịch sử → câu hỏi đóng | **CÓ** — ra khỏi thế giới |

> **Thế giới bao hàm đỡ được đúng MỘT cú đổi tỉ lệ: cú vào.** Và một cú ra ở cuối.
> **Bên trong nó: không có nấc nào.**

Lý do là cấu trúc, không phải thiếu công: **phạm vi của trường bị ghim bởi các vị trí nó phải
hiện** (497–500). Không có gì để thu vào hay giãn ra — thu vào thì mất vạch, giãn ra thì thêm
vị trí mà package không nói tới.

**Không dựng thêm nấc để đạt một con số.** Đây là hạn chế thật của thế giới này, ghi lại cho
benchmark sau: *một thế giới có phạm vi bị ghim bởi dữ liệu nó phải hiện thì không đỡ được
hành trình tỉ lệ.*

---

## Trạng thái các rủi ro còn mở

| | trạng thái | bằng chứng |
|---|---|---|
| **R18** | **XỬ XONG** | im lặng 0px×5 trong cửa sổ, 4360px sau; NC nổ |
| **R14** | **XỬ XONG** | sợi phục vụ dưới 364px / trên 0px; NC nổ |
| **R12** | **XỬ XONG** | khe hở 185=185, chuyển động 86px vs 0px; NC nổ |
| **R6** | **XỬ XONG** | ba mốc lần lượt trên một hành trình; chỉ mốc cuối có sợi nối |
| **R11** | **CHƯA XỬ — cố ý** | nửa latency dựng bằng sợi neo; nửa availability **không dựng** vì package không đỡ được đường biên timeout |
| **R4** | **CHƯA DỰNG** | thuộc beat 20–24, không nằm trong ba chương rủi ro cao của lượt này. Vẫn mở |
| **R15 · R13 · Q6** | **còn nguyên** | đầu mút riêng 802/617 cách 185px; `trong(799≤802)` 5/5 ở cả CH-B và CH-A |

---

## Camera: **0/6** — và đó là KẾT QUẢ

Không shot nào có camera. Cả sáu khai `motion: static` **kèm lý do**, không phải mặc định câm:

- **CH-B**: cú đổi hệ quy chiếu do **lời** dẫn — không còn gì để camera hé lộ. Ứng viên camera
  duy nhất của cả video chết cùng với kết luận Step 3.
- **CH-A**: bốn vị trí phải cùng **một chỗ đứng** thì mới ngang hàng. Camera ở đây sẽ tạo xếp
  hạng ngầm.
- **CH-C**: dụng cụ đo không cần đổi chỗ đứng.

Ghi đúng cách G01 ghi 11/11 tĩnh: **0/N là một kết quả có lý do**, không phải một thiếu sót.

---

## Ba lỗi dụng cụ trong lượt này — và cái thứ ba là tái phạm

Cổng L2 chặn được lỗi **khai trước**, nhưng lượt này lộ ra ba lỗi **khác loại**, tất cả đều do
negative control bắt:

1. **Khẳng định C phát biểu thiếu một mệnh đề.** Tôi khai *"cùng số đọc"* mà quên *"khác chuyển
   động"* — và mệnh đề thiếu chính là mệnh đề mang bài học. **Đo thiếu một mệnh đề cũng là
   đo-đại-lượng-thay-thế.** Phát hiện vì NC **lọt**: một shot tĩnh trivially thoả "cùng số đọc".
2. **Đo chuyển động bằng mực toàn khung.** Hai thanh 4px dịch 60px chỉ đổi vài phần nghìn số
   pixel → ra 0.15, không phân biệt được gì. Khẳng định nói *"đầu mút có tiến không"*, nên phải
   **đo thẳng đầu mút**: 86px vs 0px.
3. **Va chạm luma lần thứ ba.** `--authoritative` (#C9A227, luma ≈168) trùng dải với `--ink-mid`
   (#9AA0A6, luma ≈160), nên **sợi neo gold bị đếm là đoạn bao** và đầu mút đọc sai (khe hở ra
   62px thay vì 185px). `check-parallel-lines.mjs` đã ghi đúng bài học này từ R1 — *"phân loại
   bằng RGB chứ không bằng luma"* — và tôi **không áp lại** khi viết bộ kiểm mới.

Cộng một lỗi quy trình: **một bản vá dùng `String.replace` không guard đã âm thầm không khớp**,
và negative control ra **không có tween nào** — nên nó "nổ" vì lý do sai (chuyển động 0 ở cả hai
mốc) thay vì vì lý do đúng (hai số đọc khác nhau). **Một negative control nổ vì lý do sai vẫn là
một chặn hỏng**, và chỉ đọc kỹ con số mới thấy.
