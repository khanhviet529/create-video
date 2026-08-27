# G01 — Step 4: kiến trúc chương và hợp đồng thế giới

Timing dưới đây là **tạm**. VoiceStudio hiện offline (hai URL đã biết trả 000), nên mọi con số
giây là ước từ nhịp âm tiết của package, không phải đo. Mục 12 nói rõ cái gì đang chờ.

---

## 0. Khoá ngữ nghĩa đã áp: khung trong là PHÉP ĐO, không phải vùng vật lý

Bản Step 3 vẽ "chỗ dữ liệu sống cần" thành một khung teal bao quanh mấy hàng ô đầu. Đo lại
chính nội dung nó bao thì nó **không chỉ mơ hồ mà mâu thuẫn**: khung đó ôm cả ô trống và bỏ
sót ô sống nằm dưới nó. Nó đọc thành *phân vùng vật lý của relation*, và điều đó sai — phiên
bản sống nằm rải khắp phần đã cấp.

Sửa bằng **đổi register**, không bằng một đoạn giải thích. Một đại lượng thuộc về một trục,
không thuộc về đường bao quanh vật:

| register | hình học | mức biểu diễn |
|---|---|---|
| **THƯỚC** | hai vạch từ một gốc, trên một trục | **phép đo** — teal = chỗ dữ liệu sống cần (dài **không đổi**), vermilion = chỗ đã cấp |
| **THẾ GIỚI** | **một** khung + các ô | **vật lý** — phần đã cấp, và phiên bản tuple nằm ở đúng chỗ nó nằm |
| **PHÂN TÍCH** | khối gom, có ô đi tới | **giải tích** — chỉ xuất hiện khi cần đếm |

Vạch trên trục và ô trong khung là hai loại hình học khác nhau, nên hai mức không thể lẫn.

Đã chứng minh ở `p5-measure-register` (18s, gate sạch): không khung nào bao quanh một nhóm ô;
teal đứng yên suốt; vermilion dài ra; sau sweep, ô đổi trạng thái còn **vermilion không dịch
một pixel**.

---

## 1. Hợp đồng thế giới bền

Cố định cho cả video. **Không màu nào, không hình học nào được đổi nghĩa về sau vì một cảnh
khác cần nó.**

### Vật và nghĩa

| vật | nghĩa | được đổi gì |
|---|---|---|
| ô đặc `--ink` | một phiên bản dòng **đang sống** | trạng thái, không bao giờ vị trí |
| ô đặc `--lost` | một phiên bản **đã chết**, nằm đúng chỗ nó chết | trạng thái |
| ô viền `--rule-bright` | ô **trống, dùng lại được bên trong** | trạng thái |
| khung ngoài `--rule-bright` | **phần đã cấp** — vật lý | **chỉ nở ra**, trừ khi viết lại cả bảng |
| vạch teal `--boundary` | **chỗ dữ liệu sống cần** — phép đo | **không bao giờ đổi độ dài** |
| vạch vermilion `--stale` | **chỗ đã cấp** — phép đo | chỉ dài ra, trừ khi viết lại |
| vạch chân trời `--boundary`, nét đứt | **đường khả kiến** của một transaction mở | xuất hiện/biến mất |
| sweep `--authoritative` | **sự kiện autovacuum** đang chạy | thoáng qua |
| khối gom | **mức giải tích**, để đếm | vào/ra bằng chuyển động |

### Luật vật lý — bất biến

> UPDATE **không sửa ô tại chỗ.** Nó làm ô cũ chết **tại chỗ** và ghi phiên bản sống mới vào
> ô trống đầu tiên — một chỗ **khác**. Khung ngoài chỉ nở khi bên trong hết chỗ.

### Cái gì bền, cái gì tích luỹ, cái gì được phép biến mất

| | |
|---|---|
| **giữ danh tính** | khung ngoài · trục thước · vạch teal · lưới ô (toạ độ ô i luôn là ô i) |
| **tích luỹ** | số phiên bản chết · phần đã cấp · độ dài vạch vermilion |
| **được phép mất** | vạch chân trời (chỉ trong nhánh riêng) · khối gom (chỉ khi đang đếm) · sweep |
| **hằng số** | SỐ phiên bản sống · độ dài vạch teal |

### VACUUM đổi gì, và KHÔNG đổi gì

| | |
|---|---|
| **đổi** | ô `--lost` → ô viền (trống, dùng lại được bên trong) · số phiên bản chết về ~0 |
| **KHÔNG đổi** | khung ngoài · vạch vermilion · số phiên bản sống · vạch teal |

Ràng buộc dựng: **trong chương VACUUM, không được có một tween nào chạm vào khung ngoài hay
vạch vermilion.** Đây là điều kiểm được bằng cách đọc timeline, không phải bằng cách nhìn.

---

## 2. Kiến trúc chương

11 chương, ~163s tạm. Beat theo đúng đoạn narration của package.

| # | chương | beat | mức | thời lượng tạm |
|---|---|---|---|---|
| 1 | **Quan sát** | 1–3 | hệ thống thật | 11s |
| 2 | **Cơ chế ghi** | 4–9 | vật lý (gần) | 26s |
| 3 | **Ngưỡng** | 10–12 | vật lý + **giải tích** | 15s |
| 4 | **Cú lật** | 13–16 | vật lý | 15s |
| 5 | **Đọc lại con số** | 17–20 | **phép đo** | 16s |
| 6 | **Trạng thái ổn định** | 21–22 | vật lý | 8s |
| 7 | **Cách sửa** | 23–27 | vật lý + phép đo | 23s |
| 8 | **Vacuum chạy mà vô ích** | 28–30 | vật lý + chân trời | 14s |
| 9 | **Viết lại cả bảng** | 31–33 | vật lý → hai vật chứa | 14s |
| 10 | **Công cụ đo** | 34–37 | **thiết bị** | 15s |
| 11 | **Câu hỏi** | 38 | — | 6s |

Chỉ **ba** lần đổi thế giới thị giác trong cả video: vào thế giới (CH2), lên mức đo (CH5), ra
khỏi thế giới (CH10). Mọi chỗ khác là cùng một thế giới biến đổi.

### Từng chương

**CH1 · Quan sát (11s).** Hai con số không khớp nhau: số dòng đứng yên, dung lượng tăng. Chưa
có thế giới. Đây là câu đố, và nó phải đứng một mình để người xem tự thấy nó lạ.

**CH2 · Cơ chế ghi (26s).** Thế giới sinh ra. 44 ô sống, khung ngoài vừa khít. Rồi UPDATE:
mỗi lần một ô hoá chết tại chỗ, một ô sống mới ở chỗ khác. Khung nở **chỉ khi** bên trong hết
chỗ. Số ô sống hiện trên khung và **không đổi**, để người xem tự kiểm được.
Beat 7–8 (điều kiện khả kiến của MVCC) là **điều kiện thường trực**, không phải nguyên nhân —
nó xuất hiện như một thuộc tính của thế giới, không như một sự kiện.

**CH3 · Ngưỡng (15s).** Cần một con số, nên đây là chỗ mức giải tích kiếm được quyền tồn tại.
Ô chết **đi** từ chỗ chúng nằm xuống khối gom ở register đáy — chính cú đi là lời khai "cách
bày đổi để đếm". Đếm xong, ô **quay về đúng chỗ cũ**. Không quay về thì mức giải tích lặng lẽ
trở thành bố cục vật lý.

**CH4 · Cú lật (15s).** Ba beat không nén được: VACUUM dọn thật → không trả về OS → file không
nhỏ. Ô chết thành ô viền. **Khung ngoài không có tween nào.**

**CH5 · Đọc lại con số (16s).** Thước xuất hiện — muộn, như câu trả lời cho câu hỏi người xem
đã bắt đầu tự hỏi. Teal = chỗ sống cần, vermilion = chỗ đã cấp, và **khoảng hở giữa hai đầu là
bloat**. Đây là chương duy nhất mà phép đo là chủ thể.

**CH6 · Trạng thái ổn định (8s).** Lần ghi sau rơi vào ô viền, không đẩy khung. Vermilion
**chạm trần rồi đi ngang** — không tăng mãi.

**CH7 · Cách sửa (23s).** Ngưỡng hạ → sweep nổ sớm hơn → vermilion **dừng gần teal hơn nhiều**.
Rồi cái không đổi: số phiên bản chết sinh ra y nguyên, file vẫn không tự nhỏ. Rồi cái giá:
sweep nổ dày hơn.

**CH8 · Vacuum chạy mà vô ích (14s).** Cùng thế giới, **biến trạng thái khác**. Chi tiết ở mục 5.

**CH9 · Viết lại cả bảng (14s).** Vật chứa thứ hai xuất hiện **cùng lúc** với vật cũ — đó là
đĩa thêm. Ô sống chép sang, xếp khít. Vật cũ tắt. Khung mới nhỏ hơn. Đây là lần **duy nhất**
khung ngoài được phép co.

**CH10 · Công cụ đo (15s).** Rời thế giới. Hai cột số. Rồi ba câu "không chứng minh".

**CH11 · Câu hỏi (6s).** Giữ.

---

## 3. Bố cục: ba register, mỗi register một vai

Khung 1080×1920 chia theo nghĩa, không theo tỉ lệ:

| register | y | vai | trống nghĩa là gì |
|---|---|---|---|
| **thước** | 214–360 | phép đo | chưa tới lúc hỏi "con số này nghĩa là gì" |
| **thế giới** | 420–1300 | vật lý | phần chưa cấp — **không phải** chỗ trống dùng lại được |
| **phân tích** | 1380–1720 | giải tích | **không có phép đếm nào đang diễn ra** |

Ba vùng trống đều mang nghĩa khác nhau, nên không vùng nào là chỗ thừa.

### visual_operation → hệ quả không gian

| thao tác | khối lượng | neo dọc | vùng trống nghĩa là gì |
|---|---|---|---|
| **churn** (CH2) | thế giới, giữa khung | khung ngoài neo trên | dưới khung ngoài = chưa cấp |
| **nở** (CH2) | khung mở xuống | mép trên đứng yên | phần vừa cấp còn rỗng |
| **gom để đếm** (CH3) | dịch xuống register đáy | thế giới giữ nguyên chỗ | lỗ để lại = ô vẫn tồn tại |
| **sweep** (CH4) | không dịch gì | tất cả đứng yên | — |
| **đo** (CH5) | lên register đỉnh | thế giới lùi về ink-mid | khoảng hở hai vạch = **bloat** |
| **chân trời** (CH8) | một đường ngang cắt thế giới | tại chỗ | phía sau đường = chưa được phép dọn |
| **viết lại** (CH9) | hai vật chứa cạnh nhau | vật mới dưới vật cũ | chỗ vật thứ hai chiếm = **đĩa thêm** |
| **thiết bị** (CH10) | rời thế giới hẳn | trên cùng | thế giới vắng = đang nhìn từ ngoài |

---

## 4. VACUUM so với VACUUM FULL

| | VACUUM (CH4, CH7, CH8) | VACUUM FULL (CH9) |
|---|---|---|
| **đổi cái gì** | trạng thái ô | **số lượng vật chứa** |
| **khung ngoài** | **không tween nào** | co lại — lần duy nhất |
| **vạch vermilion** | không đổi | ngắn lại |
| **cần gì** | không | **vật chứa thứ hai tồn tại đồng thời** |
| **tần suất** | nhiều lần trong video | **một lần** |

Vật chứa thứ hai là **hình học giải thích cho cơ chế viết lại**, không phải một bảng thứ hai
người dùng thấy được, và không hàm ý "luôn cần gấp đôi đĩa". Nó tồn tại đồng thời trong đúng
khoảng thời gian chép, rồi biến mất — đó là điều package nói: *giữ cả bản cũ lẫn bản mới cho
tới khi xong*.

Khoá bảng: phải có mặt trong hình. Trong khoảng chép, **thế giới không nhận UPDATE nào** —
không ô nào đổi trạng thái ngoài việc bị chép. Sự đứng im đó là cái khoá, và nó tương phản
trực tiếp với churn liên tục ở mọi chương khác.

---

## 5. Hai lý do khác nhau khiến chỗ chết chưa được thu hồi

Đây là một trong những chỗ giá trị nhất của video, và hai lý do **dùng chung thế giới nhưng
đổi biến khác nhau**:

| | A · ngưỡng chưa tới (CH3) | B · transaction mở giữ chân (CH8) |
|---|---|---|
| **sự kiện sweep** | **không xảy ra** | **có xảy ra**, thấy rõ |
| **ô chết sau đó** | vẫn chết | **vẫn chết** |
| **biến đổi** | không có gì | **vạch chân trời** xuất hiện |
| **người xem đọc ra** | "chưa ai dọn" | "đã dọn, mà không dọn được gì" |

Cùng kết quả nhìn thấy (ô vẫn chết), **hai nguyên nhân khác nhau**, và cái phân biệt là **có
hay không có sự kiện sweep**. Ở CH8, sweep chạy qua đúng như CH4 — cùng animation, cùng màu —
và các ô phía sau đường chân trời **không đổi**. Sự tương phản với CH4 là chỗ nghĩa nằm.

Không gộp, không dùng nhãn để phân biệt.

---

## 6. Liên tục hay cắt

Nguyên tắc: **cắt khi mức biểu diễn thật sự đổi.** Không cắt vì hết beat.

| ranh giới | cắt hay liên tục | lý do |
|---|---|---|
| CH1 → CH2 | **cắt + camera vào** | đổi mức: hệ thống thật → vật lý |
| trong CH2 | liên tục | cùng thế giới, cùng mức |
| CH2 → CH3 | **liên tục** | mức giải tích **vào bằng chuyển động**, không bằng cắt |
| CH3 → CH4 | **liên tục** | ô quay về chỗ cũ trước khi sweep |
| CH4 → CH5 | **cắt + camera lùi** | đổi mức: vật lý → phép đo |
| CH5 → CH6 | liên tục | thước ở lại, thế giới trở lại chủ thể |
| CH6 → CH7 | liên tục | cùng thế giới |
| CH7 → CH8 | liên tục | **cùng thế giới, biến khác** — cắt ở đây sẽ làm mất chính sự tương phản |
| CH8 → CH9 | liên tục | vật chứa thứ hai **xuất hiện**, không thay thế |
| CH9 → CH10 | **cắt** | rời thế giới — cú duy nhất được phép |
| CH10 → CH11 | **cắt** | hết |

**Bốn cú cắt trong cả video.** Con số đó là *hệ quả* của việc chỉ có bốn lần đổi mức, không
phải chỉ tiêu — nếu Step 5 phát hiện một chương cần cắt thêm vì lý do thật thì cắt.

---

## 7. Camera

Hai lần, và cả hai phải prototype trước khi dựng:

| ở đâu | thao tác | giải thích cái gì |
|---|---|---|
| CH1 → CH2 | **vào gần** | đổi mức trừu tượng: từ "một sự việc về cái bảng" sang "bên trong chỗ lưu trữ" |
| CH4 → CH5 | **lùi ra** | thông tin chuyển thành **phạm vi**, và phạm vi không thấy được khi đang ở gần |

Mọi chỗ khác **tĩnh**. Chuyển động của vật đã đủ mang nghĩa — F01 chứng minh 17/17 shot tĩnh
vẫn đọc được, và ở đây thế giới còn động hơn nhiều.

**Câu hỏi phải trả lời bằng prototype:** cú lùi ở CH4→CH5 có thật sự lộ ra thông tin mà chuyển
động vật không truyền được không. Nếu thước ở register đỉnh đã đủ mang phạm vi — mà `p5` gợi ý
là đủ — thì cú lùi là trang trí và phải bỏ.

---

## 8. Chữ và số

Chữ **neo**, không mang cơ chế. Ba chỗ được dùng số, và chỉ ba:

| ở đâu | số gì | vì sao không bỏ được |
|---|---|---|
| CH2 | **số phiên bản sống** | lời khẳng định "số dòng đứng yên" phải **kiểm được**; đếm 44 ô bằng mắt không phải là kiểm |
| CH3 | **ngưỡng 20% ≈ 200 nghìn** | package nói thẳng con số; bỏ đi thì việc bảng phải mang chỗ dư thành vô lý |
| CH10 | **hai cột `pg_stat_user_tables`** | đây là thiết bị đo, và tên cột là thứ người xem sẽ gõ |

CH2 chỉ giữ **một** con số. Số phiên bản chết và số ô đã cấp đã nằm trong hình rồi — prototype
Step 3 hiện ba con số là để *kiểm* trong lúc R&D, không phải để dựng.

Không đoạn văn giải thích. Không trang tài liệu. Không panel code — cơ chế này không sống
trong code, nó sống trong chỗ lưu trữ. Ngoại lệ duy nhất có thể có: một dòng storage parameter
ở CH7, và ngay cả nó cũng cần cân nhắc lại ở Step 5.

---

## 9. Thời lượng tạm và cái đang chờ tiếng thật

| chương | tạm | dựa trên |
|---|---|---|
| CH1 | 11s | 3 beat ngắn |
| CH2 | 26s | 6 beat, có beat 7–8 dài |
| CH3 | 15s | 3 beat + thời gian đi và về của khối gom |
| CH4 | 15s | 4 beat, không nén được |
| CH5 | 16s | 4 beat, cần giữ để aha ngấm |
| CH6 | 8s | 2 beat ngắn |
| CH7 | 23s | 5 beat |
| CH8 | 14s | 3 beat |
| CH9 | 14s | 3 beat |
| CH10 | 15s | 4 beat |
| CH11 | 6s | 1 beat + giữ |
| **tổng** | **163s** | package khuyến nghị **157s** |

**Chờ tiếng thật:**

1. Ranh giới chương — hiện đặt theo đoạn văn, phải đặt lại theo beat đo được.
2. Thời lượng từng chương — chênh 6s so với package hiện chưa biết nằm ở đâu.
3. Nhịp của cú đi/về ở CH3 — phụ thuộc beat 11 và 12 dài bao nhiêu.
4. Thời điểm sweep ở CH4 — phải rơi đúng chữ "chạy VACUUM", không sớm không muộn.
5. Số update trong CH2 — hiện 33; phải khớp thời lượng thật của beat 4–9.
6. Khoảng giữ cuối mỗi chương — luật ≤3.0s từ F01 vẫn áp dụng.

**Quy trình giọng cho G01** (không kế thừa từ F01): thử `namtre_v2` trước · dựng lại profile
trên runtime đang chạy, **id sẽ khác** · bắt đầu ở speed **1.00** · xác minh qua provider
history từng segment · chỉ hiệu chỉnh lại tốc độ nếu số đo cho thấy lệch đáng kể. URL lấy từ
env, không hardcode.

---

## 10. Cần prototype trước khi vào Step 5

Xếp theo mức có thể giết kiến trúc:

**P1 — cú đi/về của mức giải tích (CH3).** Ô chết đi xuống khối gom rồi **quay về đúng chỗ**.
Nếu cú quay về không đọc ra thì mức giải tích đã lặng lẽ thành bố cục vật lý, và ngưỡng 20%
phải tìm cách khác. Rủi ro cao nhất vì nó đụng vào chính luật vật lý của thế giới.

**P2 — CH4 và CH8 cạnh nhau.** Hai chương phải đọc ra là *hai lý do khác nhau*. Phải xem liền
mạch, câm, không nhãn. Nếu người xem không phân biệt được "chưa dọn" với "dọn rồi mà không
dọn được", đây là chỗ mất nhiều nhất.

**P3 — cú lùi ở CH4→CH5.** Có lộ ra thông tin gì mà thước không truyền được không. Mặc định
là **không**, và prototype phải chứng minh ngược lại thì mới giữ.

**P4 — CH9, hai vật chứa + khoá bảng.** Sự đứng im trong lúc chép phải đọc ra là khoá, không
đọc ra là hình bị treo.

**P5 — CH2 dài 26 giây.** `p1` đã chứng minh 30s không reset, nhưng CH2 phải mang thêm beat
7–8 (điều kiện khả kiến) mà không biến chúng thành một sự kiện. Điều kiện thường trực khó vẽ
hơn sự kiện.
