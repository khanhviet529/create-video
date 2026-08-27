# G01 — Semantic Analysis

Nguồn sự thật: `content-package.yaml` (package 006, sha256 `d80b5956…`, provenance **CURRENT**).
Chưa có quyết định thị giác nào trong tài liệu này.

---

## 1. Vai nhân quả — chỗ dễ sai nhất của topic này

Package tách vai rất rõ, và toàn bộ độ khó nằm ở việc **không** gộp chúng lại.

| vai | thứ gì | vì sao không phải vai khác |
|---|---|---|
| **điều kiện thường trực** | MVCC: một phiên bản chết không được xoá chừng nào còn nhìn thấy được với transaction khác | Luôn đúng, **kể cả khi không có bloat**. Bỏ nó thì cơ chế không tồn tại — nhưng bản thân nó không tạo ra tích tụ nào. `e1`, `role: precondition` |
| **hằng số định cỡ** | Ngưỡng autovacuum: 50 dòng + 20% số dòng bảng | Nó **định cỡ** sự tích tụ chứ không tạo ra nó. Đặt ngưỡng 2% thì vẫn tích tụ, chỉ ít hơn. `e2`, `role: precondition` |
| **NGUYÊN NHÂN** | Nhịp UPDATE lặp lại trên cùng những dòng | Bỏ hành động này ra thì không có gì tích tụ. `e3`, `role: primary_cause` |
| **hệ quả 1** | Phiên bản chết tích tụ | `e4` |
| **hệ quả 2** | File xin thêm chỗ từ OS để chứa cả sống lẫn chết | `e5` |
| **giảm nhẹ** | VACUUM dọn thật, đánh dấu chỗ dùng lại được bên trong | `e7`, `role: mitigation` — **không phải chỗ hỏng** |
| **BẤT BIẾN BỊ PHÁ** | Dọn xong, dòng chết về ~0, file không đổi một byte | `e8`, `role: invariant_violation` |
| **bằng chứng phụ** | Transaction mở lâu giữ đường chân trời khả kiến | `e6`, nhánh riêng. Giải thích "vacuum chạy mà vô ích", **không phải cơ chế chính** |
| **trạng thái cuối** | Chỗ trống được tái dùng → bảng **ngừng lớn**, không nhỏ lại | `e9` |

**Khoá ngữ nghĩa số 1.** Package ghi thẳng trong `format.reason_for_duration`: gộp *"chưa được
thu hồi"* với *"đã thu hồi nhưng không trả về hệ điều hành"* là **dạy sai cả bài**. Đây là hai
trạng thái khác nhau của cùng một chỗ nhớ, và chúng cách nhau đúng một sự kiện (`e7`).

---

## 2. Cái gì đứng yên, cái gì lớn, cái gì bị trì hoãn

| đại lượng | suốt sáu tháng | sau khi VACUUM | trạng thái cuối |
|---|---|---|---|
| `live_rows` | **đứng yên** ở một triệu | đứng yên | đứng yên |
| `dead_versions` | **tích tụ** tới ~200 nghìn | **về gần 0** | dao động dưới ngưỡng |
| `file.bytes` | **lớn dần** | **không đổi** | **đứng yên ở mốc cao nhất** |
| `reusable_inside` | 0 | **200 nghìn** | được tái dùng cho lần ghi sau |
| `space_returned_to_os` | 0 | **0** | 0 |

**Cái bị trì hoãn** có hai lớp, và chúng khác nhau:

1. **Trì hoãn theo ngưỡng** — autovacuum không chạy liên tục; nó đợi 20%. Đây là trì hoãn
   *theo lịch*, sửa được bằng cách hạ ngưỡng.
2. **Trì hoãn theo khả kiến** — một phiên bản chết chưa được phép xoá chừng nào còn nhìn
   thấy được. Đây là trì hoãn *theo điều kiện*, **không** sửa được bằng cách hạ ngưỡng.

**Cái ngăn thu hồi** cũng có hai thứ khác nhau, và đây là chỗ hai cách sửa khác nhau tách ra:

- ngưỡng chưa tới → vacuum **chưa chạy** → hạ ngưỡng là đúng thuốc
- transaction mở lâu → vacuum **chạy rồi, báo xong, và không dọn được gì** → hạ ngưỡng
  **vô ích**, chỉ làm nó chạy thường xuyên hơn mà vẫn không thu hồi

---

## 3. Cú lật — ba beat không nén được

Package nói rõ bỏ beat giữa là **dạy ngược hoàn toàn**:

1. VACUUM **dọn phiên bản chết thật**. Số dòng chết về gần không.
2. Nhưng nó **không trả chỗ về hệ điều hành** — đánh dấu dùng lại được, bên trong chính bảng.
3. Nên **file không nhỏ đi một byte**.

Bỏ (1) → dạy "Postgres không bao giờ xoá row" (sai, và `rejected_explanations` #1).
Bỏ (2) → dạy "VACUUM hỏng" (sai, và là hành động sai phổ biến nhất).
Bỏ (3) → mất luôn cú aha.

---

## 4. Aha — một sự đọc lại con số, không phải một sự kiện

> **người xem nghĩ**: kích thước file đo lượng dữ liệu đang sống trong bảng
> **thực ra**: nó là **mốc nước cao nhất** — lượng dữ liệu đồng thời lớn nhất bảng từng phải
> chứa. Mốc nước thì **chỉ đi lên**.

Đây là điểm phân biệt lớn nhất so với E01/F01: hai video kia có một **sự cố** — một query
chậm, một tài liệu bị lộ. G01 **không có sự cố nào**. Package tự nói điều đó:

> "Topic này không có sự cố nên không có cú hích nào kéo người xem đi giúp — mọi thứ phải do
> chuỗi nhân quả tự kéo."

`bloat` = **chênh lệch** giữa chỗ file chiếm và chỗ dữ liệu sống cần. Không phải kích thước.

---

## 5. Bằng chứng phụ

- Autovacuum **vẫn chạy bình thường**, và số dòng chết **vẫn về gần không** sau mỗi lần.
- Kích thước file **không giảm một byte** sau bất kỳ lần dọn nào.

Cặp này quan trọng vì nó loại trước giả thuyết "autovacuum hỏng" — công cụ đang làm đúng
việc của nó. Đó là điều làm cú lật thành cú lật.

---

## 6. Bốn cách giải thích sai, và hành động sai mà mỗi cái dẫn tới

| cách nói sai | hành động sai nó dẫn tới |
|---|---|
| "Postgres không bao giờ xoá row" | kết luận không có cách nào lấy lại chỗ → **bỏ luôn việc chỉnh autovacuum** |
| "Chạy VACUUM là file nhỏ lại" | chạy VACUUM, thấy không đổi → **kết luận VACUUM hỏng** hoặc bảng có vấn đề nặng hơn |
| "Bảng lớn nghĩa là bảng bị bloat" | **chạy VACUUM FULL trên bảng chỉ đơn giản là nhiều dữ liệu** — khoá bảng production đổi lấy không gì cả |
| "n_dead_tup về 0 nghĩa là hết bloat" | **cảm giác an toàn ngay tại công cụ dùng để kiểm** — nguy hiểm nhất trong bốn |

---

## 7. Cách sửa và cái giá

**Chính**: hạ `autovacuum_vacuum_scale_factor` xuống ~0.02 cho **riêng bảng nóng**
(storage parameter per-table).

- **được**: mốc nước bị giữ thấp **ngay từ đầu**. Đó là thứ duy nhất thật sự kiểm soát được,
  vì mốc nước một khi đã lên thì chỉ viết lại cả bảng mới hạ được.
- **không đổi**: số phiên bản chết sinh ra **không giảm chút nào**; file **vẫn không bao giờ
  tự nhỏ lại**; query, lược đồ, code ứng dụng giữ nguyên. **Đây KHÔNG phải cách lấy lại chỗ
  đã mất.**
- **giá**: autovacuum chạy thường hơn → I/O và CPU đều hơn. Trên bảng gần như chỉ INSERT thì
  là **công quét vô ích**. Con số 2% là khuyến nghị của người viết, **không phải giá trị
  trong doc** — phải chỉnh theo từng bảng.

**Ba cách thay thế, mỗi cách chạm vào một mắt xích khác:**

| cách | chạm vào | không tương đương vì |
|---|---|---|
| Giảm tốc độ sinh phiên bản chết | **nguồn** của tích tụ | cách **duy nhất** làm giảm TỔNG lượng việc; ba cách kia chỉ đổi thời điểm/điều kiện. Đắt nhất |
| Kết thúc transaction mở lâu | **điều kiện khả kiến** | cách **duy nhất** xử lý được ca "vacuum chạy mà không dọn được". Hạ ngưỡng không cứu được |
| VACUUM FULL | **chính mốc nước** | cách **duy nhất** làm file thật sự nhỏ lại. Không đụng nguyên nhân — bảng sẽ lớn lại đúng như cũ |

**Trớ trêu của VACUUM FULL**, package nêu thẳng: nó cần **thêm đĩa** (giữ cả bản cũ lẫn bản
mới), nên **lúc đĩa gần đầy chính là lúc khó chạy nó nhất**. Cộng ACCESS EXCLUSIVE lock suốt
thời gian chạy.

---

## 8. Tín hiệu phát hiện, và bốn thứ nó KHÔNG chứng minh

**Tín hiệu**: trong `pg_stat_user_tables`, đọc `n_dead_tup` **cùng với** `last_autovacuum`.
Dòng chết cao **kèm** lần dọn gần nhất đã cũ → thu hồi không theo kịp, **hoặc** đang bị chặn.
Phân biệt hai khả năng bằng `age(backend_xmin)` trong `pg_stat_activity`.

**Không chứng minh:**

- `n_dead_tup` **cao** không chứng minh đang bloat — có thể autovacuum sắp chạy.
- `n_dead_tup` **bằng 0** không chứng minh không bloat — chỉ nói **vừa dọn xong**; mốc nước
  vẫn nguyên. *(Package đánh dấu đây là chỗ hay nhầm nhất.)*
- **bảng lớn** không chứng minh bloat — bloat là chênh lệch, không phải kích thước.
- `last_autovacuum` **mới** không chứng minh vacuum thu hồi được gì — nếu có transaction cũ
  chặn thì nó chạy xong mà không dọn được.

**Bốn false positive**: autovacuum vừa bị hoãn vì bận bảng khác · bảng vừa qua đợt ghi lớn và
ngưỡng chưa tới · bảng đơn giản là lớn thật · transaction mở lâu đang chặn (và đó là **vấn đề
khác** với autovacuum yếu).

---

## 9. Replay — đã dựng, và một giới hạn đã đo được

`semantics.yaml` dựng **ba kịch bản**, cả ba replay khớp tuyên bố của câu chuyện:

| kịch bản | vỡ | giữ |
|---|---|---|
| `default_threshold` | `size_tracks_live_data`, `reclaim_returns_space` | `dead_versions_are_reclaimed`, `live_rows_stay_flat` |
| `blocked_by_open_txn` | thêm `dead_versions_are_reclaimed` — **dấu phân biệt** | `live_rows_stay_flat` |
| `lower_threshold` | chỉ `reclaim_returns_space` | `high_water_held_low` (1020 thay vì 1200) |

Điều quan trọng: bất biến vỡ **không phải** "dòng chết không được dọn" — chúng **có** được
dọn. Bất biến vỡ là **"dọn dữ liệu chết thì dung lượng trên đĩa giảm"**. Replay ép đúng cách
phân vai đó.

### GIỚI HẠN: replay engine không biểu diễn được tính đơn điệu

Tuyên bố trung tâm của video — *"mốc nước thì chỉ đi lên"* — **hiện không thể bị replay bác
bỏ**. Đây là đo, không phải suy luận:

Tôi dựng một kịch bản y hệt `default_threshold` nhưng chèn `file.bytes` **tụt 1200 → 900 →
1200** — một cú tụt Postgres không bao giờ làm. Kết quả:

```
size_tracks_live_data        violated (as the story claims)
reclaim_returns_space        violated (as the story claims)
dead_versions_are_reclaimed  holds
live_rows_stay_flat          holds
✓ replay matches the story's claims
```

**Sạch hoàn toàn.** Lý do nằm ở `simulate.mjs:260-320`: `final_state` chỉ so **giá trị cuối**
với một hằng số, `bounded` chỉ so **đỉnh** với một trần. Một cú tụt giữa đường không chạm vào
cái nào.

Cái còn thiếu là một loại invariant so **giá trị cuối với chính đỉnh của nó** — hoặc khẳng
định "không bao giờ giảm". `simulate.mjs` đã theo dõi `f.peak` (dòng 129) nên dữ liệu có sẵn;
chỉ chưa có invariant nào đọc nó theo chiều đó.

**Chưa đổi công cụ.** Báo trước theo đúng yêu cầu. Đề xuất khi được duyệt: thêm kind
`monotonic` (`never_decreases` / `never_increases`) và/hoặc `high_water_mark`
(`final === peak`). Đây là ~15 dòng trong `evaluateInvariant`, không phải một hệ thống mới —
nhưng nó là **bất biến trung tâm của video này**, nên nó nên kiểm được trước khi dựng hình.

---

## 10. Literalization review

> *"Nếu tôi biến câu này thẳng thành chuyển động, tôi có dạy đúng cơ chế không?"*

| câu | dựng thẳng thành gì | đúng? |
|---|---|---|
| "Postgres không bao giờ xoá row" | phiên bản cũ **ở lại mãi mãi** | ❌ VACUUM **có** xoá. Dựng thế thì người xem bỏ luôn việc chỉnh autovacuum |
| "VACUUM shrink file" | file **co lại** | ❌ Đảo ngược đúng cú aha |
| "bảng lớn = bloat" | bảng to → cảnh báo | ❌ Bloat là **chênh lệch**. Dựng thế thì dẫn tới VACUUM FULL trên bảng lành |
| "dead tuple = xoá được ngay" | phiên bản chết **biến mất khi sinh ra** | ❌ Bỏ mất điều kiện khả kiến, tức bỏ mất lý do MVCC tồn tại |
| "dòng đứng yên thì dung lượng phải đứng yên" | — | ✅ **Đây chính là kỳ vọng sai cần dựng ra**, rồi phá. Nhưng phải dựng như **kỳ vọng của người xem**, không phải như sự thật |
| "file không nhỏ đi một byte" | quy luật vật lý tuyệt đối | ⚠️ **Đúng trong phạm vi kịch bản.** `technical_notes` nêu ngoại lệ: trang trống hẳn ở CUỐI bảng + lấy được exclusive lock dễ → VACUUM **có** trả chỗ. Hình không được dựng thành định luật |
| "mốc nước chỉ đi lên" | đường chỉ tăng | ✅ Đúng trong phạm vi — nhưng **VACUUM FULL hạ được nó**, và narration [31] nói thế. Hình phải cho phép nó hạ ở đúng beat đó |
| "bloat lớn mãi" | đường tăng vô hạn | ❌ **Sai.** Narration [21-22]: bảng đạt trạng thái ổn định thì **ngừng lớn**. Đường phải **chạm trần rồi đi ngang** |

---

## 11. Mơ hồ và mâu thuẫn tìm được

**Không có mâu thuẫn ngữ nghĩa nào trong package.** Ba chỗ cần khoá lại khi dựng hình, tất cả
đều đã được package tự xử lý — vấn đề là hình dễ vượt quá:

1. **"Không nhỏ đi một byte" là mệnh đề có phạm vi, không phải định luật.** Package khoá bằng
   `technical_notes` #1. Hình phải ở trong bảng-đang-chịu-ghi, không được dựng thành quy luật
   phổ quát của Postgres.

2. **"Tăng đều suốt sáu tháng" [2] so với "ngừng lớn" [22].** Không mâu thuẫn: sáu tháng là
   **đoạn dốc lên tới mốc nước**, trạng thái ổn định là **cái trần** ở cuối. Nhưng nếu hình
   dựng đường tăng mãi thì nó mâu thuẫn với chính beat 22. `semantic_model.states` xác nhận:
   `đang tăng` ×4 rồi `đứng yên ở mốc cao nhất`.

3. **Ngưỡng là "50 dòng + 20%"** (`technical_truth`, `e2`) nhưng narration [11] chỉ nói "hai
   mươi phần trăm". Không phải lỗi — package ghi trong `edge_cases` rằng với bảng nhỏ thì
   ngưỡng 50 dòng chi phối, và video giới hạn ở bảng một triệu dòng. Hình **không được** vẽ
   công thức đầy đủ rồi bỏ vế 50, vì như thế là tự tạo mâu thuẫn với chính mình.

**Một quan sát về gói, không phải lỗi:** `semantic_model.states[].timeline` trộn số
(`1000000`) với chuỗi mô tả (`"tăng dần"`, `"gần 0"`). Nó đọc được cho người nhưng không kiểm
được bằng máy, nên `semantics.yaml` phía tôi phải quy ra số. Các con số đó là **tham số kịch
bản** do tôi chọn để mô hình chạy được, và đã ghi rõ như vậy trong file.
