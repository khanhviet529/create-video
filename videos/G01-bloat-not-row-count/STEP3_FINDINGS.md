# G01 — Step 3, Hero Visual R&D

7 prototype, tất cả gate sạch, tất cả render. Kết luận dưới đây rút từ **đo và xem câm**,
không từ suy luận.

---

## 0. Chốt replay: invariant `monotonic`

`final == peak` **không** diễn đạt được sự thật cần diễn đạt. Vết 1200 → 900 → 1200 có
`final` và `peak` bằng nhau, nên một invariant so hai cái đó vẫn cho qua. Thứ bắt được là
**tính đơn điệu**, và nó phải có phạm vi.

Đã thêm `kind: monotonic` với `direction: never_decreases | never_increases`, ghi nhân chứng
cho từng lần giảm (`simulate.mjs`). `f.peak` nay khởi tạo từ giá trị ban đầu, nên một cú tụt
ngay từ state khai báo cũng bị bắt.

**Không mã hoá luật phổ quát.** Invariant khai trong từng kịch bản, và comment trong code nói
thẳng: file quan hệ của Postgres **có** co được — VACUUM FULL viết lại bảng, narration beat 31
nói đúng thế. Kịch bản VACUUM FULL sẽ đơn giản là không khai invariant này.

`tests/monotonic-invariant.test.mjs`, 11 check, đã vào `npm test`:

```
ok  a file that only ever grows holds the invariant
ok  the 1200 -> 900 -> 1200 trace FAILS   file.bytes fell 1200 -> 900 at dip
ok  it carries a witness for the drop     [{"event":"dip","from":1200,"to":900}]
ok  final_state alone would have passed the dip
ok  bounded alone would have passed the dip
ok  a drop from the DECLARED initial value is caught
ok  an unknown direction is refused, not silently accepted
```

Ba kịch bản G01 nay khai `file_never_gives_back_space` và cả ba giữ. E01 (3 kịch bản) và F01
(2 kịch bản) replay lại vẫn sạch — không hồi quy.

---

## 1. Sửa neo không gian

Bản trước viết *"các ô sống đứng yên tuyệt đối"*. Sai, và sai theo kiểu nguy hiểm: nó mua
tính liên tục bằng cách đóng băng thứ mà cơ chế bắt buộc phải động. UPDATE không sửa tại chỗ
— nó ghi phiên bản mới **ở chỗ khác**. Một ô sống đứng yên qua nhiều UPDATE chính là hình ảnh
update-in-place, đúng thứ video tồn tại để bác bỏ.

Thế giới là **vật lý** và tuân đúng hành vi đó. Neo là một **đại lượng**, không phải vị trí:
*chỗ mà dữ liệu sống cần* — một vùng có diện tích cố định vì SỐ phiên bản sống là hằng số.
Bloat là khoảng cách giữa vùng đó và biên cấp phát, đúng định nghĩa package đưa.

Mọi prototype đều thi hành luật này.

---

## 2. R1 — thế giới bền, 30 giây

**Đạt.** `p1-world-30s`, 30.00s, một thế giới, không reset.

Đo trên 6 khung rải đều:

| t | sống | chết | đã cấp |
|---|---|---|---|
| 4s | 44 | 2 | 55 |
| 12s | 44 | 15 | 66 |
| 19s | 44 | 26 | 77 |
| 23.5s | 44 | 26 | 77 (sweep đang chạy) |
| 29.5s | 44 | **0** | **77** |

Ba điều đọc được **không cần một chữ giải thích nào**:

1. Số ô sống không đổi suốt — và đếm lại được, vì con số bên trên chính là số ô mực trên
   khung.
2. Vùng bị chiếm lớn dần, và **chỉ lớn khi bên trong hết chỗ**.
3. Sweep làm ô chết **trống thật**, còn biên **đứng im tuyệt đối**.

Khung cuối là cú aha: khung teal (chỗ 44 ô cần) nằm gọn trong khung ngoài (77 ô đã cấp), và
khoảng giữa hai khung là bloat — một khoảng cách nhìn thấy được, không phải một khái niệm
được nêu.

Thế giới **không nhàm** trong 30 giây: 12 khung lấy mẫu đều khác nhau, và trạng thái tích tụ
liên tục nên mắt luôn có thứ để so với lần nhìn trước.

---

## 3. R2 — dùng lại bên trong vs trả về OS

**Đạt, nhưng chỉ sau khi sửa một lỗi render đã che mất kết luận.**

Lượt đầu: `p2a` cho ô chết **biến thành đen tuyền** sau sweep. Ô trống vẽ bằng viền 1.5px màu
`--ink-ghost` (#3A3E42) trên nền #0C0D0F — ở cỡ ô đó nó không render ra gì. Nên "chỗ dùng lại
được" đọc thành **"ô biến mất"**, tức là cách một bước khỏi "trả về hệ điều hành" — đúng chỗ
package gọi là gộp vào là dạy sai cả bài.

Nếu báo "R2 hỏng" ở đó thì báo sai nguyên nhân: hỏng là một lựa chọn màu, không phải cơ chế.

Sau khi đổi ô trống sang viền 3px `--rule-bright`:

| | thao tác trên màn hình |
|---|---|
| **p2a** dùng lại bên trong | chỉ **trạng thái ô** đổi: đặc → viền rỗng. **Không có một tween nào chạm vào khung cấp phát** trong cả file |
| **p2b** trả về OS | **một vật chứa thứ hai xuất hiện bên dưới**, phiên bản sống chép sang đó xếp khít, vật cũ tắt, rồi khung mới — nhỏ hơn — dời lên chỗ cũ |

Hai thao tác khác nhau ở **loại vật thay đổi**, không ở mức độ. Một bên đổi trạng thái ô, một
bên đổi **số lượng vật chứa**. Người xem câm phân biệt được mà không cần nhãn.

Phần thưởng ngoài dự tính: vật chứa thứ hai tồn tại đồng thời **chính là** "cần thêm đĩa" của
VACUUM FULL. Cái giá thành hệ quả không gian, không cần một dòng chữ.

---

## 4. R3 — biên vượt khung vs thước đo cố định

**p3a bị loại, và lý do là số học chứ không phải thẩm mỹ.**

Đo dải 60px sát đáy khung ở 4 thời điểm: `YMAX = 26` (nền trơn) ở **cả bốn**. Biên chưa bao
giờ ra khỏi viewport. Premise của biến thể này chưa hề được kiểm — hai lần.

Tính ngân sách thì rõ vì sao:

| cỡ ô | số hàng cần để chạm đáy | số UPDATE | nhịp trên đoạn narration ~25s |
|---|---|---|---|
| 76px (đọc được) | 15 | **132** | **5.3 update/giây** |
| 56px (nhỏ hơn) | 20 | **192** | **7.7 update/giây** |

Ở cỡ ô đủ để thấy từng phiên bản, **cần nhiều UPDATE hơn beat có thể chứa**. Muốn biên ra khỏi
khung thì phải hoặc thu nhỏ ô tới mức không đọc được từng ô nữa, hoặc chạy update nhanh tới
mức không đếm được cái nào. Cả hai đều phá chính thứ thế giới này tồn tại để cho thấy.

**p3b đạt.** Thước ở đỉnh khung: vạch teal = chỗ dữ liệu sống cần (dài **không đổi**, vì số
phiên bản sống là hằng số), vạch vermilion = chỗ đã cấp (dài ra). Đây là cách đọc rõ nhất
trong cả bộ, kể cả ở cỡ thumbnail, và **không có gì để nhầm với chuyển động camera** vì không
gì rời khung.

---

## 5. R4 — ô chết rải hay gom

**p4a (rải, đúng vật lý) — đúng nhưng không đếm được.**

Lượt đầu dùng `(u*11) % n` để chọn ô, ra một **đường chéo đều tăm tắp** — đó là hoạ tiết, không
phải churn. Đổi sang `(u*37+13) % n` thì rải ra thật. Nhưng ngay cả khi rải đúng, **đếm 20%
bằng mắt là không thể**. Đó là cái giá có thật của việc trung thành với bố cục lưu trữ.

**p4b (gom, khai là đổi mức) — đạt.** Ô chết **di chuyển** từ chỗ chúng nằm tới một khối ở
góc dưới, để lại **lỗ có viền** đúng chỗ cũ. Chính cú di chuyển là phần trung thực: nó nói
"cách bày đã đổi để đếm", không nói "tuple nằm ở đó". Và khối gom thì đếm được.

Kết luận: **hai mức, không phải chọn một.** Bố cục vật lý là mặc định; khi narration cần một
con số (ngưỡng 20%), chuyển sang mức phân tích bằng một cú di chuyển nhìn thấy được, rồi quay
lại. Cú di chuyển là thứ giữ cho hai mức không bị nhầm.

---

## 6. Hướng bị loại, và lý do kỹ thuật

| hướng | vì sao loại |
|---|---|
| **Biên nở ra khỏi viewport** (p3a) | Cần 132–192 UPDATE để chạm đáy khung ở cỡ ô đọc được — 5–8 update/giây, vượt ngân sách của beat. Đo bằng YMAX ở dải đáy: trống ở cả 4 thời điểm |
| **Ô sống đứng yên** | Dạy update-in-place. UPDATE ghi phiên bản mới ở chỗ khác; đóng băng ô sống là mua liên tục bằng cách nói dối cơ chế |
| **Gom ô chết làm bố cục mặc định** | Đổi mô hình lưu trữ đang dạy. Chỉ hợp lệ như một mức phân tích, và chỉ khi cú chuyển mức nhìn thấy được |
| **Ô trống vẽ mờ** (viền 1.5px ink-ghost) | Render ra hư không ở cỡ ô này → sweep đọc thành xoá. Cách một bước khỏi "trả về OS", tức đúng cách gộp mà package cấm |
| **Tăng trưởng khung bằng `left/top/width/height`** | Snap về pixel nguyên, rung dưới engine seek từng khung. Gate bắt ngay lượt đầu. Khung nay là bốn thanh, lớn lên bằng transform |
| **Ba con số trên đỉnh khung** | Giữ ở prototype để *kiểm* được lời khẳng định, nhưng ở bản dựng chỉ nên còn **một** — số phiên bản sống — vì hai con số kia đã nằm trong hình rồi |

---

## 7. Cơ chế hero được chọn

**Thế giới ô lưu trữ vật lý, với hai khung hình học và một thước ở đỉnh.**

| thành phần | vai |
|---|---|
| ô đặc `--ink` | phiên bản sống |
| ô đặc `--lost` | phiên bản chết, nằm đúng chỗ nó chết |
| ô viền `--rule-bright` | chỗ trống, **dùng lại được bên trong** |
| khung ngoài `--rule-bright` | chỗ đã cấp — **chỉ nở ra** |
| khung trong `--boundary` | chỗ dữ liệu sống cần — **diện tích không đổi** |
| thước ở đỉnh (từ p3b) | mang thông tin tỉ lệ mà không cần gì rời khung |
| khối gom (từ p4b) | mức phân tích, vào và ra bằng một cú di chuyển nhìn thấy được |

Bloat = khoảng cách giữa hai khung. Không phải một nhãn, không phải một icon cảnh báo: một
khoảng cách đo được trên màn hình.

---

## 8. Defect bắt được trong lượt này

Tất cả đều lộ ra do **đo hoặc xem**, không do đọc lại code:

1. `gsap_non_transform_motion` — gate bắt tween `left/top/width/height`.
2. `content_overlap` trên counter xếp chồng — tôi dùng nhầm `data-layout-allow-occlusion`;
   check này cần `data-layout-allow-overlap`. Hai check khác nhau, hai opt-out khác nhau.
3. **Ô trống vô hình** — che mất kết luận R2.
4. **Hai `gsap.set` cùng một thời điểm** giải quyết không nhất quán dưới seek từng khung, để
   cả hai chữ số hiện cùng lúc ("06"). Ẩn sớm hơn một khung thì hết.
5. **Số cứng 48 cạnh 44 ô** — thế giới đổi cỡ mà con số không đổi theo. Con số trên khung phải
   là `LIVE_N`, không bao giờ là literal, vì cả lời khẳng định nằm ở chỗ nó bằng số ô đếm được.
6. **p3a không ra khỏi khung** — hai lần, và lần thứ hai mới đo thay vì nhìn.
7. **`(u*11) % n` vẽ đường chéo** thay vì churn.

---

## 9. Mâu thuẫn ngữ nghĩa mới

**Không có.** Một quan sát về tỉ lệ cần khoá lại ở Step 4:

Thế giới hiện chiếm khoảng **35% chiều cao khung** (mực từ y≈380 tới y≈1070 trong khung
1920). Với 44 ô sống và 77 ô cấp thì đó là tỉ lệ đúng, nhưng nó để trống hơn 800px phía dưới.
Đây là bài toán bố cục của Step 4, không phải bài toán cơ chế — và nó có lời giải sẵn: thước
của p3b sống ở đỉnh, khối gom của p4b sống ở đáy, nên cả ba mức dùng hết chiều cao mà không
cái nào phải phình ra.
