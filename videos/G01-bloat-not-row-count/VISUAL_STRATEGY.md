# G01 — Visual Strategy

Dẫn xuất từ `SEMANTIC_ANALYSIS.md` và package 006. Chưa dựng shot nào.

---

## 0. Điều kiện xuất phát khác hẳn E01/F01

E01 có một query chậm. F01 có một tài liệu bị lộ. **G01 không có sự cố nào** — package tự
nói: *"không có cú hích nào kéo người xem đi giúp, mọi thứ phải do chuỗi nhân quả tự kéo."*

Hệ quả trực tiếp lên chiến lược: **không thể mượn lực từ một khoảnh khắc hỏng.** Lực phải đến
từ việc người xem **nhìn thấy một thứ lớn dần trong khi một thứ khác đứng yên**, và thấy nó
liên tục đủ lâu để tự thấy khó chịu. Đó là lý do topic này hợp với thế giới thị giác bền
(persistent world) hơn hẳn hai video trước — và cũng là lý do nếu cắt nó thành cảnh rời thì
nó chết.

---

## 1. Đối tượng người xem bám theo

**File của bảng — cụ thể là BIÊN NGOÀI của nó.**

Không phải cái bảng, không phải các dòng. Cái biên. Vì cái biên là thứ **chỉ đi một chiều**,
và toàn bộ tuyên bố trung tâm nằm ở đó: *kích thước file là mốc nước cao nhất*.

Nhưng câu chuyện cần **hai** đại lượng phân kỳ, và điểm mạnh là chúng **không phải hai vật**:

| | là gì trong thế giới |
|---|---|
| chỗ dữ liệu sống cần | **một vùng tham chiếu bên trong** — diện tích cố định, vì SỐ phiên bản sống là hằng số. Bản thân các phiên bản thì churn |
| kích thước file | **biên bao quanh** — chỉ nở ra |

Chúng là **cùng một vật nhìn theo hai cách**: chỗ nội dung CẦN và chỗ vật chứa CHIẾM. Nên sự phân kỳ xảy ra
**bên trong một đối tượng**, không phải giữa hai biểu đồ đặt cạnh nhau. Đó là khác biệt giữa
"chỉ ra một tương phản" và "cho tương phản tự diễn ra".

---

## 2. Thế giới thị giác bền

**Một vật chứa có ranh giới, chứa các ô, mỗi ô giữ một phiên bản dòng.**

Đây không phải ẩn dụ — đó **là** mô hình lưu trữ. Page và tuple. Không cần bịa hình tượng nào
lên trên nó.

Cam kết cấu trúc: **vật chứa xuất hiện ở beat 4 và phải tồn tại liên tục cho tới beat 33.**
Shot nào phá nó đi rồi dựng lại phải nêu lý do trong plan. Kiểm được bằng đo YMAX giữa hai đầu
cú cắt — công cụ đã có từ F01.

Chỉ tiêu đo được thay cho lời hứa: **F01 có 2/16 cú cắt là match cut. G01 phải có đa số.**
Nếu thế giới bền thật thì phần lớn ranh giới shot là chuyển tiếp trong một thế giới, không
phải chuyển cảnh.

---

## 3. Cái gì thay đổi dần, cái gì đứng yên trong không gian

### Sửa một lỗi kỹ thuật trong bản trước

Bản đầu của tài liệu này viết *"các ô sống đứng yên tuyệt đối, không dịch một pixel"*. **Sai**,
và sai theo đúng kiểu nguy hiểm nhất: nó mua tính liên tục không gian bằng cách đóng băng một
thứ mà cơ chế bắt buộc phải động.

Trong Postgres, UPDATE **không sửa tại chỗ**. Nó ghi một phiên bản MỚI ở chỗ khác — thường là
trang khác — rồi đánh dấu phiên bản cũ là chết. Đó là câu đầu tiên của cả cơ chế (`e3`,
narration [5-6]). Nên phiên bản vật lý đang sống của một dòng **dịch chuyển sau mỗi UPDATE**.
Một ô "sống" đứng yên qua nhiều UPDATE chính là hình ảnh của update-in-place — đúng thứ video
tồn tại để bác bỏ.

### Thế giới là VẬT LÝ, và neo là một ĐẠI LƯỢNG

Thế giới bền biểu diễn **ô lưu trữ vật lý**, vì cơ chế sống ở đó — trong chỗ file chiếm. Nên
nó phải tuân đúng hành vi của phiên bản tuple:

| | hành vi không gian |
|---|---|
| **phiên bản sống** | **dịch chỗ sau mỗi UPDATE** — bản mới ghi ở chỗ khác, không sửa tại chỗ |
| **phiên bản chết** | **nằm lại đúng chỗ** bản cũ đã ở, không dồn về đâu cả |
| **số phiên bản sống** | **hằng số** — luôn chừng ấy ô, dù chúng là những ô nào |
| **biên ngoài** | **chỉ nở ra**, và chỉ khi bên trong hết chỗ |
| **camera** | tĩnh ở mặc định |

Neo nhận thức không phải một **vị trí**, mà là một **đại lượng**:

> **chỗ mà dữ liệu sống cần** — một vùng có diện tích cố định, vì số phiên bản sống là hằng số.

Vùng đó không dịch vì nó không phải một vật; nó là một phép đo. Và đây đúng là định nghĩa
bloat mà package đưa ra — *chênh lệch giữa chỗ file chiếm và chỗ dữ liệu sống cần*. Neo trở
thành một trong hai vế của chính công thức.

Điều này mạnh hơn bản sai trước: người xem không bám theo mấy ô đứng im, họ bám theo **hai đại
lượng phân kỳ** — một vùng tham chiếu bất động về diện tích, và một biên cứ nở ra khỏi nó. Cái
ở giữa là bloat.

### Nếu ô đại diện cho DÒNG LOGIC thì phải nói ra

Có một lựa chọn thứ hai hợp lệ: ô = **dòng logic** (bản ghi nghiệp vụ). Khi đó chúng đứng yên
được, vì một dòng logic không dịch đi đâu. Nhưng lúc đó thế giới thôi là bố cục lưu trữ, và
mọi phát biểu về file phải chuyển sang một mức biểu diễn khác.

**Chọn vật lý.** Toàn bộ cú aha nằm ở quan hệ giữa nội dung và chỗ nó chiếm; ở mức logic thì
"file" không tồn tại. Ràng buộc đi kèm là bắt buộc: **thế giới vật lý phải diễn đúng hành vi
vật lý**, kể cả khi nó khó đọc hơn. Đó chính là nội dung của R4.

---

## 4. Cú aha, và cơ chế không gian của nó

**Mẹo cốt lõi: giữ kích thước hiển thị của phần nội dung sống KHÔNG ĐỔI, và để biên nở ra
vượt khỏi khung hình.**

Nếu thu nhỏ cả vật chứa cho vừa khung, thì "file lớn hơn dữ liệu cần" biến mất — mọi thứ chỉ
nhỏ đi đều. Giữ nội dung nguyên cỡ và để biên đi ra khỏi mép khung thì câu *"chỗ nó chiếm thì
không"* trở thành thứ **nhìn thấy được**, không phải thứ được nói ra.

Đây cũng là cách trả lời câu hỏi khó nhất của package:

### "dùng lại được bên trong" ≠ "trả về hệ điều hành"

Hai trạng thái này **không được** phép nhìn giống nhau. Cách tách: chúng là **hai đường
khác nhau**.

| | đường nào | sự kiện |
|---|---|---|
| chỗ chết được dọn | **mật độ chiếm dụng bên trong** giảm | VACUUM — xảy ra nhiều lần |
| chỗ trả về OS | **biên ngoài** co vào | **chỉ VACUUM FULL** |

Vì chúng là hai đường hình học khác nhau, chúng không thể bị nhầm. Và **bloat trở thành thứ
đo được trên màn hình**: khoảng cách giữa mật độ bên trong và biên ngoài. Đúng định nghĩa
package đưa — *chênh lệch*, không phải kích thước.

Đây là chỗ toàn bộ hướng đi này thắng hay thua. Nếu prototype cho thấy hai đường vẫn bị đọc
lẫn, hướng này phải bị loại chứ không được vá bằng nhãn chữ.

---

## 5. Cơ chế không gian cho từng ý

| ý ngữ nghĩa | cơ chế không gian |
|---|---|
| **tích tụ** | một UPDATE = ô sống cũ **hoá chết tại chỗ** + một ô sống mới **ghi ở chỗ khác**. Chết nằm rải đúng nơi chúng chết. Đếm được |
| **số dòng sống đứng yên** | **số** ô sống không đổi — đếm lại lúc nào cũng chừng ấy, dù là những ô KHÁC. Vùng tham chiếu "chỗ dữ liệu sống cần" giữ nguyên diện tích |
| **file lớn lên** | biên nở ra, **và chỉ khi bên trong hết chỗ** — nhân quả nhìn thấy được |
| **thu hồi bị trì hoãn** | **không có gì xảy ra**, rất lâu, trong khi bên trong đầy dần. Sự trì hoãn LÀ khoảng lặng đó |
| **ngưỡng** | một mức trong vật chứa; sweep chỉ nổ khi chạm mức |
| **VACUUM dọn thật** | ô chết **trống đi thật** — không mờ đi, không đổi màu: trống |
| **biên không đổi** | sweep chạy qua, **biên đứng im tuyệt đối** — không một pixel |
| **tái dùng** | lần ghi sau **rơi vào ô vừa trống**, không đẩy biên |
| **trạng thái ổn định** | biên **chạm trần rồi đi ngang** — KHÔNG tăng mãi (khoá ngữ nghĩa #2) |
| **transaction mở lâu** | một **đường chân trời** cắt ngang thế giới; sweep chạy qua và các ô sau đường đó **không trống đi** |
| **cách sửa** | ngưỡng hạ xuống → sweep nổ sớm hơn → **biên dừng ở gần hơn nhiều** |
| **VACUUM FULL** | **một vật chứa thứ hai** phải tồn tại đồng thời — đó chính là "cần thêm đĩa" — rồi vật cũ biến mất và biên mới co lại |

Bảng cuối cùng đáng chú ý: cái giá của VACUUM FULL (*cần thêm đĩa*) và sự trớ trêu của nó
(*lúc đĩa gần đầy là lúc khó chạy nhất*) trở thành **hệ quả không gian trực tiếp**, không cần
một dòng chữ nào giải thích.

---

## 6. Thang biểu diễn — dùng bốn mức, không phải sáu

| mức | dùng ở đâu | vì sao |
|---|---|---|
| trạng thái hệ thống thật | beat 1–3 | phải neo vào chuyện có thật: một triệu dòng, sáu tháng, dung lượng tăng |
| **mô hình lưu trữ bên trong** | beat 4–27 | **đây là nơi cơ chế sống**. Phần lớn video ở đây |
| hệ quả vận hành | beat 28–33 | transaction mở lâu, VACUUM FULL và cái giá |
| **công cụ đo** | beat 34–37 | **bước RA khỏi thế giới** — đọc hai cột số là một hành vi khác hẳn |

Không dùng "trừu tượng hoá cấu trúc trực quan" như một mức riêng: mô hình lưu trữ ở đây đã
đủ trực quan (ô và vật chứa), thêm một tầng ẩn dụ giữa chỉ làm loãng.

**Chuyển mức phải giữ danh tính.** Từ beat 3 vào beat 4 là một cú **thu gần** vào chính cái
bảng vừa nói tới, không phải cắt sang hình khác. Từ beat 33 sang 34 là cú **duy nhất được
phép rời thế giới**, và nó phải được cảm thấy như rời đi.

---

## 7. Camera — hai chỗ được phép, không hơn

Mặc định **tĩnh**. Chuyển động nội bộ của vật thể đã đủ mang nghĩa; F01 đã chứng minh 17/17
shot tĩnh vẫn đọc được.

Hai chỗ camera **kiếm được** quyền di chuyển:

1. **Beat 4 — thu gần vào bảng.** Quan hệ không gian thật sự đổi: từ "bảng như một vật" sang
   "bên trong bảng". Giữ danh tính đối tượng qua cú zoom.
2. **Beat 17–19 — lùi ra để thấy cả biên.** Cú aha cần người xem thấy **toàn bộ** khoảng cách
   giữa nội dung và biên cùng lúc. Đây là chỗ duy nhất trong video mà thông tin nằm ở
   *phạm vi*, nên nó là chỗ duy nhất mà thay đổi phạm vi là nội dung.

Mọi chỗ khác: tĩnh. **Không** dùng camera để tạo cảm giác "điện ảnh".

**Chỗ đứng yên có ích:** beat 10–12 (chờ ngưỡng). Sự trì hoãn chỉ cảm được nếu thật sự phải
chờ. Đó là beat mà không làm gì là việc phải làm.

---

## 8. Chống tái diễn F01

F01 kết thúc bằng: trang tài liệu canh trái, panel code, nhãn hiện tại chỗ, thẻ chữ, và ngữ
pháp co/mờ lặp lại. G01 đặt ra các ràng buộc **đo được** để chuyện đó không lặp lại:

| ràng buộc | cách kiểm |
|---|---|
| Thế giới bền, không phải chuỗi cảnh rời | đa số cú cắt phải là match cut YMAX=0 |
| Chữ không phải vật liệu mặc định | đo tỉ lệ khung mà **chữ là mực chủ đạo** — mục tiêu: thiểu số rõ rệt |
| Code chỉ ở nơi cơ chế thật sự sống trong code | trong G01 **chỉ có một chỗ**: dòng cấu hình `autovacuum_vacuum_scale_factor` ở beat 24 |
| Không lặp ngữ pháp chuyển động | liệt kê cơ chế tween thực tế theo họ, như đã làm với 5 shot narrowing của F01 |
| Mực không dồn lên một góc | đo biên độ trên/dưới và trái/phải — **chẩn đoán, không phải chỉ tiêu** |

Chỗ chữ **được** dùng, và chỉ ba chỗ: bảng công cụ đo ở mức 4, một dòng cấu hình ở beat 24,
câu hỏi kết ở beat 38.

---

## 9. Chống "phong cách điện ảnh AI"

Bảng màu giữ nguyên hệ đã có, và **mỗi màu phải có vai ngữ nghĩa**:

| màu | vai trong G01 |
|---|---|
| `--ink` | phiên bản **sống** |
| `--lost` | phiên bản **chết** |
| `--ink-ghost` | ô **trống, dùng lại được** — cấu trúc, không phải nội dung |
| `--rule-bright` | **biên ngoài** của file |
| `--stale` | chỗ **chênh lệch** (bloat) và chỗ cần chú ý |
| `--boundary` | **đường chân trời khả kiến** của transaction mở lâu |
| `--authoritative` | sự kiện **sweep** của autovacuum |

Không gradient tím, không glow, không HUD giả, không hạt bay, không thẻ nổi, không 3D trang
trí, không camera động liên tục, không đồ thị mạng vô nghĩa. Chiều sâu — nếu dùng — chỉ để
phân biệt **bên trong vật chứa** với **bên ngoài nó**, tức là đúng cái phân biệt mà cả video
xoay quanh.

---

## 10. Điều KHÔNG mang lại từ F01

| không mang | vì sao |
|---|---|
| **Trang tài liệu canh trái** | F01 là một lập luận đọc theo dòng. G01 là một cơ chế diễn ra trong không gian |
| **Ngữ pháp "một shot một ý"** | 17 shot rời của F01 phù hợp với một lập luận. Ở đây một hệ thống phải sống 15–30 giây liên tục và biến đổi dần |
| **Họ narrowing (co/gạch/mất sắc độ)** | Không có tập nào bị thu hẹp trong G01. Có một thứ **tích tụ** và một thứ **đứng yên** |
| **Dấu hiện diện trong bảng** | Giải pháp đúng cho F01 vì ở đó thứ cần đếm là "có/không". Ở đây thứ cần đếm là **các phiên bản có thật**, và chúng phải là chính chúng |
| **Match cut như biệt lệ** | F01 chỉ có 2 match cut, đều là sự kiện đặc biệt. Ở G01 liên tục là **mặc định**, cắt rời mới là biệt lệ cần lý do |
| **Camera tĩnh tuyệt đối** | F01 tĩnh 17/17 và đúng. G01 có hai chỗ mà thay đổi phạm vi **là** thông tin |
| **Chữ làm vật liệu chính** | đảo hẳn: thế giới là vật liệu, chữ là ngoại lệ có lý do |

---

## 11. Nguyên tắc mới đang thử ở 006

1. **Thế giới bền thay cho chuỗi cảnh** — một vật chứa sống từ beat 4 tới beat 33.
2. **Neo nhận thức là một ĐẠI LƯỢNG, không phải một vị trí** — "chỗ dữ liệu sống cần" giữ
   nguyên diện tích trong khi các phiên bản vật lý bên trong churn liên tục. Không mua tính
   liên tục bằng cách đóng băng thứ mà cơ chế bắt buộc phải động.
3. **Phân kỳ trong một đối tượng** thay vì tương phản giữa hai đối tượng.
4. **Hai đường hình học cho hai trạng thái dễ nhầm** — mật độ bên trong và biên ngoài — để
   "dùng lại được" và "trả về OS" không thể bị đọc lẫn.
5. **Bloat như một khoảng cách đo được trên màn hình**, đúng định nghĩa "chênh lệch".
6. **Cái giá của giải pháp là hệ quả không gian** — VACUUM FULL cần vật chứa thứ hai tồn tại
   đồng thời, và đó chính là "cần thêm đĩa".
7. **Trì hoãn diễn bằng thời lượng thật**, không bằng nhãn "chờ ngưỡng".
8. **Ra khỏi thế giới đúng một lần**, ở chỗ hành vi thật sự đổi (đọc công cụ đo).

---

## 12. Nhịp cho ~157 giây

Package khoá thời lượng ở 157s với lý do chi tiết cho từng phần không nén được. Nhịp đề xuất
theo mức biểu diễn, chưa phải theo shot:

| đoạn | beat | mức | tính chất |
|---|---|---|---|
| mở | 1–3 | hệ thống thật | ngắn, đặt câu đố |
| dựng cơ chế | 4–9 | trong bảng | thu gần, thế giới sinh ra, UPDATE lặp |
| **chờ** | 10–12 | trong bảng | **giữ lâu** — sự trì hoãn phải cảm được |
| **cú lật** | 13–16 | trong bảng | ba beat không nén được |
| **aha** | 17–20 | trong bảng, lùi ra | mốc nước, và bloat thành khoảng cách |
| tin tốt | 21–22 | trong bảng | chạm trần, đi ngang |
| sửa | 23–27 | trong bảng | ngưỡng hạ, biên dừng gần hơn, và cái giá |
| nhánh riêng | 28–30 | trong bảng | đường chân trời |
| VACUUM FULL | 31–33 | hệ quả vận hành | vật chứa thứ hai, cái giá, sự trớ trêu |
| **rời thế giới** | 34–37 | công cụ đo | cú cắt duy nhất được phép rời |
| hỏi | 38 | — | giữ |

---

## 13. Câu hỏi rủi ro cao nhất cho Step 3

Bốn cái, xếp theo mức độ có thể giết cả hướng đi:

### R1 — Thế giới bền có sống nổi 15–30 giây mà không nhàm không?

**Rủi ro cao nhất.** Cả chiến lược dựa trên giả định này. Nếu một vật chứa với các ô biến đổi
dần trở nên đơn điệu sau 12 giây thì hướng "persistent world" sai với topic này, và phải quay
lại chuỗi cảnh.

Prototype phải chạy **ít nhất 25 giây liên tục** và được xem câm, không cắt.

### R2 — "Dùng lại được bên trong" và "trả về OS" có tách được không?

Package nói gộp hai cái là dạy sai cả bài. Đề xuất của tôi là dùng hai đường hình học khác
nhau. Nhưng nếu người xem câm vẫn đọc "sweep xong thì mọi thứ nhỏ lại", cơ chế đó thất bại —
và **không được vá bằng nhãn chữ**, vì như thế là quay về F01.

### R3 — Biên nở ra khỏi khung: người xem hiểu là "file lớn" hay là "camera zoom"?

Mẹo giữ nội dung nguyên cỡ để biên vượt mép khung là thứ làm cú aha thành hình. Nhưng nó có
thể bị đọc thành máy quay lại gần. Cần thử ít nhất hai biến thể — biên vượt mép, và biên nằm
trong khung với một thang đo — rồi so bằng xem câm.

### R4 — Ô chết xen kẽ tại chỗ, hay dồn thành vùng riêng?

Xen kẽ **đúng về mặt lưu trữ** (phiên bản mới ghi vào chỗ còn trống, chết nằm lại tại chỗ) và
nó làm "tái dùng chỗ vừa trống" thành chuyện tự nhiên. Nhưng dồn thành vùng riêng thì **đếm
dễ hơn nhiều**, và ngưỡng 20% dễ đọc hơn hẳn.

Đây là đánh đổi giữa **đúng cơ chế** và **đọc được**, nên nó phải được quyết bằng prototype
chứ không bằng suy luận. Nếu xen kẽ không đếm được thì cân nhắc một bản trung gian: xen kẽ,
nhưng có một thước đo tổng ở rìa.

---

## 14. Chưa quyết

- Vật chứa là **một mặt phẳng ô** hay **một cột trang xếp chồng**. Cột trang gần mô hình page
  của Postgres hơn; mặt phẳng dễ thấy mật độ hơn. Step 3.
- Sáu tháng biểu diễn bằng **lặp chu kỳ** hay bằng **một trục thời gian**. Trục thời gian dễ
  hiểu nhưng kéo về phía biểu đồ, tức là về phía F01. Step 3.
- Có cần thấy **một dòng cụ thể** bị UPDATE nhiều lần (một dòng, nhiều phiên bản) trước khi
  lùi ra thấy cả bảng không. Nó dạy `n_dead_tup` đếm phiên bản chứ không đếm bản ghi bị xoá —
  một never_say — nhưng thêm một mức thu gần nữa.
