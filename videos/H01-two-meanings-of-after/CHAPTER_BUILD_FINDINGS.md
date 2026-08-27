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

---

# Năm chương còn lại — phủ nốt 39 beat

Gate sạch 6/6 (5 chương + 1 negative control). Không chương nào neo timing vào 169s.

## Bản đồ 39 beat — không hở

| chương | beat | trạng thái |
|---|---|---|
| **CH-1** · sự cố | 1–7 | dựng lượt này |
| **CH-2** · cơ chế | 8–12 | dựng lượt này — **cú vào tỉ lệ** |
| **CH-3** · cửa sổ | 13–15 | dựng lượt này |
| **CH-B** · aha | 16–19 | đã có |
| **CH-4** · hai bảo đảm và cái giá | 20–24 | dựng lượt này — **R4** |
| **CH-A** · bốn vị trí | 25–33 | đã có |
| **CH-C** · phát hiện | 34–38 | đã có |
| **CH-5** · câu hỏi | 39 | dựng lượt này — **cú ra tỉ lệ** |

**Beat chưa có chương: KHÔNG CÓ.** Tám chương, 39 beat.

## Cú vào và cú ra của tỉ lệ

Trần tỉ lệ = 1, đã đo và đã chấp nhận. **Không chương nào ở đây cố tạo nấc giả để bù.**

- **CÚ VÀO — ranh giới beat 7 → 8.** CH-1 ở mức giao diện (hai ô đọc, không có log). Beat 8
  (*"Postgres ghi mọi thay đổi vào một cái log"*) mở đường lịch sử, và từ đó tới hết CH-C thế
  giới là **một**.
- **CÚ RA — ranh giới beat 38 → 39.** CH-C đóng ở mức dụng cụ đo; CH-5 rời thế giới, chữ và chỉ
  chữ, đối xứng với CH-1.
- **Bên trong: không nấc nào.** CH-2 → CH-C giữ nguyên phạm vi 497–500.

## CH-1 · sự cố (beat 1–7) — 14s

**§4 V2.1:** bền = hai ô đọc · trạng thái = ô người dùng lùi về cũ · cấu trúc = ô thứ hai mở ra
· biểu diễn = không đổi · chỗ trống = chưa có nghĩa (chưa có thế giới) · camera = tĩnh, chưa có
thế giới để đi vào.

Beat 4 (*"họ gọi đó là mất dữ liệu"*) và beat 5 (*"không có gì mất"*) là **một chuyện xảy ra với
một vật**: ô người dùng lùi về `giá trị cũ`, rồi ô thứ hai mở ra và `giá trị mới` **vẫn nằm đó,
không đổi tới hết chương**. Bác một từ vựng sai **bằng sự có mặt của một vật**, không bằng một
nhãn chữ — nên trên màn hình không có chữ *"mất dữ liệu"* nào để người xem mang đi.

## CH-2 · cơ chế (beat 8–12) — 17s · CÚ VÀO

**§4 V2.1:** bền = đường lịch sử + hai tiền tố · trạng thái = commit, câu đọc · cấu trúc = từ ô
đọc sang đường lịch sử · biểu diễn = không đổi · chỗ trống = phần log chưa áp · camera = tĩnh,
**cú vào tỉ lệ là đổi thứ TRƯỜNG CHỨA, không phải đổi chỗ đứng của máy quay**.

Beat 12 nói về **độ trễ** — một chuyện thời gian — trong khi thế giới là **vị trí**. Áp đúng bài
học R18: không mở một trục thời gian ở đây. Độ trễ hiện ra ở việc **đầu mút tiền tố dưới TỚI
MUỘN** — một quá trình, không phải một trục.

Nền: `A` 802/617 cách **185px** · `B R15` `trong(799≤802)` **5/5**.

## CH-3 · cửa sổ (beat 13–15) — 12s

**§4 V2.1:** bền = trục thời gian riêng · trạng thái = hai khoảng mở ra · cấu trúc = khoảng thứ
hai lồng vào khoảng thứ nhất · biểu diễn = không đổi · chỗ trống = phần sau mép phải mỗi khoảng
· camera = tĩnh, thiết bị chỉ sống ba beat rồi nghỉ.

Chỗ đã chốt ở cổng chặn: một thiết bị thời gian riêng **dùng lại quan hệ BAO HÀM**. Hai khoảng
**chung gốc** (mốc commit), và khoảng trong **kết thúc bên trong** khoảng ngoài.

```
E  khoảng ngoài x 200..802 · khoảng trong x 200..564
   cùng mốc xuất phát: CÓ (lệch 0px) · mép phải trong < ngoài: CÓ
   → KHOẢNG TRONG KẾT THÚC BÊN TRONG KHOẢNG NGOÀI
```

Hai khoảng ở **hai mức y khác nhau** — LAW-1 được áp: không để hai vật cùng nghĩa chồng mức.

## CH-4 · hai bảo đảm và cái giá (beat 20–24) — 18s · R4

**§4 V2.1:** bền = thế giới bao hàm · trạng thái = khoảng chênh đóng rồi mở lại · cấu trúc = hai
loại bằng chứng khác nhau · biểu diễn = không đổi · chỗ trống = khoảng chênh = cái giá · camera
= tĩnh, hai bảo đảm phải cùng một chỗ đứng.

**R4 giải bằng hai LOẠI bằng chứng, không bằng hai trạng thái của một thang:**

| bảo đảm | vị từ về | bằng chứng trên màn hình |
|---|---|---|
| read-your-writes | **một cặp** | **quan hệ TĨNH** giữa hai dấu — không gì chuyển động |
| eventual consistency | **điểm cuối** | **CHUYỂN ĐỘNG hoàn tất** — đầu mút dưới đi tới nơi |

```
D  read-your-writes:     đầu mút dịch   0px  (cần ≤3  — bằng chứng TĨNH)
   eventual consistency: đầu mút dịch 184px  (cần ≥20 — bằng chứng CHUYỂN ĐỘNG)
   → HAI LOẠI BẰNG CHỨNG KHÁC NHAU

negative control (hai bảo đảm thành hai ĐÈN cùng hình):
   đèn 1: 0px · đèn 2: 0px → CÙNG MỘT LOẠI — đã thành thang bật/tắt → nổ đúng
```

Khác **loại vị từ** thì khác **loại bằng chứng**, nên không có thang nào để gộp chúng vào.
Beat 21 = **"hai"**; monotonic reads **không dựng, không đặt tên**.

Beat 22–24 (*"không phải bug, là một cái giá"*): sau khi EC hoàn tất, trường **trả về đúng trạng
thái đã trả** — tiền tố dưới lùi về 499 và khoảng chênh quay lại. Cái giá vẫn ở đó **sau khi**
EC xong; đó là cách hình nói *"mất cái này không bắt buộc phải mất cái kia"*.

## CH-5 · câu hỏi (beat 39) — 8s · CÚ RA

Chữ và chỉ chữ. Đối xứng với CH-1 — mở bằng một sự cố, đóng bằng một câu hỏi. Không dựng công
phu hơn mức cần, theo §7.

## R11 — vẫn "chưa đủ", không đụng

Package nói đúng một từ (*"đứng"*), không có chữ nào về timeout. Không mượn từ ngoài package.

## Refactor có kiểm được

Tách `tools/h01-shared.mjs` để generator thứ hai không sao chép hình học — đúng cách hai layout
prototype đã trôi khỏi nhau ở Step 3. Băm SHA-256 sáu shot đã verify trước và sau khi tách:
**6/6 byte-identical**, nên refactor **trung tính** và ba chương lõi không bị chạm.

---

# Lắp → review câm → giọng

## Bước 1 · lắp, CÂM

`output/STEP_3_R1.mp4` → sau khi sửa: **131.00s · 3930 khung · không có audio stream**.
Tám chương, xếp theo `time`, chỉ shot không `status` vào bản cắt (đúng hợp đồng của `cmdCompose`).

Tái lập: `node tools/cv.mjs compose H01-two-meanings-of-after`

## Bước 2 · full-video review CÂM — **QUA**

Review lần đầu báo 7 mục không đạt. Ba loại nguyên nhân khác nhau, và phải phân biệt:

### Hai KHUYẾT TẬT THẬT, đã sửa

**(1) `ch-do-luong` cấp phát thừa 8.25s đuôi.** Chuyển động cuối ở 13.75s, thời lượng khai 22s.
Quãng đứng *giữa* chương chỉ 2.00s — thân chương lành, tôi cấp phát thừa. Cắt về **17s**.

**(2) Thế giới KHÔNG bền qua ch2 → ch3 → ch-aha.** Đo được: `ch-aha` mở bằng khung **0k mực**,
tức CH-3 **tháo** thế giới rồi CH-aha **dựng lại**. Đó là phá chính điều "thế giới bền" nghĩa là
gì, và không mute test nào của từng chương riêng thấy được.

Sửa: CH-3 **giữ** đường lịch sử và hai dấu, chỉ bỏ **đoạn bao** (tức bỏ khẳng định về vị trí —
đúng thứ R18 đòi cho cửa sổ hệ đồng hồ ngay sau đó); thiết bị thời gian xuống `y=1330`, không
thay chỗ thế giới. CH-aha **thừa hưởng** đường + hai dấu thay vì dựng lại.
Kết quả: `ch2→ch3` **0.55** và `ch3→ch-aha` **0.70** — liên tục.

### Một LỖI DỤNG CỤ

**Mục 5 (LOCK-1).** Báo primary dày 11px vs replica 10px. Đo lại ở cột **xa chốt đầu mút**:
**4px = 4px** ở cả x=300/450/600. Chênh do hai chốt vươn **ngược chiều** trong cửa sổ y±8 —
tôi đo một đại lượng thay thế. Hai thanh cùng CSS class, cùng độ dày theo cấu tạo. **LOCK-1 đạt.**

### Một KHAI BÁO CỦA TÔI ĐÃ CŨ, và một LỖI PHẠM TRÙ

**Mục 1.** Tôi khai `ch2→ch3` và `ch3→ch-aha` là CẮT. Đúng **trước** bản sửa; sai **sau** bản
sửa, vì bây giờ thế giới bền xuyên qua. Cập nhật khai báo là đúng.
Thêm: hai chỗ nối có một đầu **0k mực** (`ch1→ch2`, `ch-do-luong→ch5`) được ghi là **KHÔNG PHÂN
GIẢI ĐƯỢC**, không phải đạt hay trượt — trung bình toàn khung không có gì để bám khi một đầu
trống, đúng cảnh báo đã ghi trong `check-continuity.mjs` từ G01.

**Mục 4 — PUSHBACK.** Ngưỡng 3.0s của F01 là ngưỡng cho **LẶNG** trên khung đứng. Bản **câm**
không có lời, nên mọi quãng đứng đều là "lặng" theo định nghĩa, và so với ngưỡng đó là **lỗi
phạm trù**: nó không phân biệt được *giữ có lý do dưới lời đang nói* với *chết hình*. Câu hỏi
thật — quãng nào **còn** đứng khi đã có lời — cần timing giọng, tức thuộc voiced review.
Mục 4 giờ **ĐO ĐƯỢC, KHÔNG PHÁN QUYẾT ĐƯỢC** ở bản câm.

### Kết quả sáu mục

| | mục | kết quả |
|---|---|---|
| 1 | liên tục qua 7 chỗ nối | 5 ✓ · 2 không phân giải được (đầu 0k mực) |
| 2 | trí nhớ không gian | đường `170..909` và đầu mút primary `802` **giữ nguyên** qua cả 5 chương có thế giới |
| 3 | bố cục | **4/8** vùng trọng tâm khác nhau — không đồng dạng |
| 4 | khoảng đứng | đo được, phán quyết thuộc voiced review |
| 5 | LOCK-1 replica chậm | 4px = 4px → không xếp hạng hai node |
| 6 | LOCK-2 mất dữ liệu | **0** pixel báo động chạm dấu commit ở cả 5 chương |

Tái lập: `node tools/review-h01-mute.mjs`

## Bước 3 · giọng — sinh và đo XONG, nhưng **KHÔNG ghép được**

### Sinh + xác minh

**39/39 segment**, `namtre_v2 · speed 1.00 · seed 1 · vi`, không dropped chunk, RIFF hợp lệ.

Xác minh **hai bằng chứng độc lập**, không tin HTTP 200:
- `/history` (46 bản ghi): **39/39** `audio_id` tra được · tập `profile_id` = `{b1aeb993}` ·
  seed `{1}` · lang `{vi}` → **một giọng duy nhất**
- `/profiles/b1aeb993`: `name "namtre_v2"` · `ref_text` **khớp byte** · `instruct` **khớp byte**

### Tốc độ THẬT TOÀN BÀI

```
tổng 39 wav (ghép sát)  = 168.45s
711 âm tiết / 168.45s   = 4.22 âm/giây      ← ĐO THẬT
trải theo beat          = 3.54 – 4.92
    4.18 (ước lượng 5 beat) → 170.1s   lệch 1.6s
    4.21 (package khai)     → 169.0s   lệch 0.5s
```

Con số **4.21 mà package khai gần như đúng**; ước lượng 5 beat của tôi lệch xa hơn. Ghi lại:
**18.3% mẫu không thay được phép đo toàn bài**, dù nó tình cờ rất gần.

### Vì sao KHÔNG ghép — đo được, không phải cảm nhận

Bản câm 131.0s, lời 168.4s. Nếu chỉ **nối đuôi** cho đủ:

```
chương            lời THẬT  đang dựng  động cuối   lời-trên-khung-đứng
ch1-su-co           24.2s      14.0s      7.75s          16.4s
ch2-co-che          21.9s      17.0s     13.75s           8.1s
ch3-cua-so          13.9s      12.0s      6.00s           7.9s
ch4-bao-dam         23.5s      18.0s     13.25s          10.2s
ch-bon-vi-tri       45.2s      30.0s     26.25s          18.9s
ch-do-luong         21.7s      17.0s     16.75s           4.9s
```

Nên tôi thêm **retiming giãn vị trí sự kiện** vào `h01-shared.mjs` (giãn ở lúc SINH, vì renderer
seek bằng `.seek(t)` nên `timeScale` vô tác dụng dưới capture theo khung; giãn **vị trí** mà giữ
nguyên `duration` để không làm chậm từng sự kiện). Rồi **đo lại** thay vì tin nó hoạt động:

```
chương            lời THẬT  cụm sự kiện  giây/sự kiện  khoảng lớn nhất SAU KHI GIÃN
ch1-su-co           24.2s       4           6.0s              8.9s
ch2-co-che          21.9s       6           3.6s              5.3s
ch3-cua-so          13.9s       3           4.6s              6.9s
ch-aha              11.3s       4           2.8s              4.4s
ch4-bao-dam         23.5s       4           5.9s              8.4s
ch-bon-vi-tri       45.2s      11           4.1s              8.4s
ch-do-luong         21.7s       9           2.4s              6.1s
ch5-cau-hoi          6.9s       2           3.4s              4.2s
```

> **Cả tám chương vẫn có khoảng > 4s sau khi giãn.** Giãn không cứu được, và nguyên nhân **không
> phải timing mà là kiến trúc**: các chương được dựng để **chứng minh cơ chế** ở nhịp chọn cho
> kiểm câm, không phải để **chở 39 beat lời**. Mật độ thật là 2.4–6.0 giây/sự kiện, trong khi
> lời có một beat mỗi **~4.3s** (168.45 / 39).

**Không ghép giọng lên đó.** Một bản có giọng với 4–9s khoảng trống ở mọi chương là artifact tệ
hơn không có bản nào — và nó sẽ che đúng thứ vừa đo được.

Cái cần là **đặt lại sự kiện ở mức beat**: mỗi beat một sự kiện hình, dùng đúng bảng offset đã
đo từ 39 segment (`voice/_retime.json`, `voice/_rate39.json`). Đó là việc dựng, không phải việc
timing, nên nó là lượt sau — và nó cần được duyệt trước khi tôi tự chốt chỗ từng sự kiện.

Tái lập:
`node tools/cv.mjs compose H01-two-meanings-of-after` ·
`node tools/review-h01-mute.mjs` ·
`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 videos/H01-two-meanings-of-after/voice/segments/seg01.wav`
