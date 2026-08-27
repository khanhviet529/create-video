# G01 — Step 4.5: prototype rủi ro cao + trạng thái tiếng thật

6 prototype (P1, P2, P3a/P3b, P4, P5), tất cả gate sạch, tất cả render. Kết luận rút từ **đo
và xem câm**.

---

## 1. P1 — vật lý → giải tích → vật lý

**Đạt.** `p1-roundtrip`, 22s.

Thiết bị: **tuple không bao giờ rời slot của nó.** Thứ đi xuống khối gom là một **bản sao của
cách vẽ**, còn slot giữ lại một **ghost** suốt thời gian đó. Không gì trong relation đổi; chỉ
đổi chỗ đang vẽ một sự thật về nó.

| t | trạng thái |
|---|---|
| 5.4s | 9 phiên bản chết nằm rải trong thế giới |
| 7.2s | bản sao đang đi xuống; slot giữ ghost |
| 10.5s | 9 ô xếp một hàng trong register giải tích, đếm được, số **9** dưới nó |
| 14.6s | đang quay về |
| 17.5s | **về đúng slot cũ**, thế giới y nguyên |
| 21.6s | giữ — không khác 17.5s |

Cú quay về đọc được không cần chữ. Đó là thứ biến chuyến đi thành **đổi cách biểu diễn** chứ
không thành lời khẳng định về lưu trữ.

**Một sửa cần thiết.** Bản đầu vẽ ghost bằng viền 2px `--lost` ở opacity .5 — render ra gần
như không có gì, nên trong lúc bản sao đi vắng thế giới đọc thành *"những tuple đó đã bị xoá"*,
đúng cách hiểu mà ghost sinh ra để chặn. Sửa thành viền 3px, opacity đầy. Ở độ phân giải thật
ghost là một ô tối có viền xám rõ — "chỗ này vẫn còn thứ gì đó".

Ghi chú phương pháp: tôi suýt kết luận sai từ contact sheet thu nhỏ, nơi viền 3px còn 1px.
**Trạng thái mảnh phải xem ở cỡ thật.**

---

## 2. P2 — chưa tới ngưỡng so với snapshot giữ chân

**Đạt.** `p2-threshold-vs-snapshot`, 30s, **một thế giới liên tục**, ba pha:

| t | pha | có sweep? | ô chết sau đó |
|---|---|---|---|
| 5.0s | 1 · chưa tới ngưỡng | **không** | vẫn chết |
| 9.9s | 2 · tới ngưỡng | **có**, dải ochre chạy | — |
| 12.4s | 2 · sau sweep | | **thành ô trống** |
| 14.0s | 3 · chân trời hiện | | vẫn chết |
| 21.4s | 3 · sweep chạy | **có**, *cùng animation* | — |
| 23.5s | 3 · sau sweep | | **vẫn chết** |

Phân biệt nằm hoàn toàn ở **sự kiện và trạng thái**, không ở nhãn: khung 12.4s (đã dọn) so với
khung 23.5s (không dọn được) là cùng một sweep, hai kết cục.

Liên tục CH7 → CH8 được giữ: cắt ở đó sẽ phá chính phép so sánh.

---

## 3. P3 — camera tĩnh so với cú lùi

**Loại cú lùi.** Lý do là đo, không phải thẩm mỹ.

Cùng nội dung, cùng thước, cùng thời điểm t=11.6s:

| | ô hiển thị | thông tin thêm so với A |
|---|---|---|
| **A · tĩnh** | nguyên cỡ (76px) | — |
| **B · lùi** | **62%** (47px) | **không có** |

Thước ở register đỉnh giống hệt nhau trong cả hai. B **mất** thông tin — từng phiên bản khó
đọc hơn — và tệ hơn: **việc thu nhỏ triệt tiêu một phần chính tín hiệu lớn lên**, vì thế giới
co lại đúng lúc phần cấp phát nở ra.

Cú lùi không lộ ra thứ gì thước không truyền được. Bỏ.

Hệ quả: `CHAPTER_ARCHITECTURE` §7 mất một trong hai cú camera. Còn lại **một** — cú vào gần ở
CH1→CH2, và nó vẫn phải tự chứng minh ở Step 5.

---

## 4. P4 — viết lại và sự đứng im

**Đạt sau hai lần sửa.** `p4-rewrite-lock`, 20s.

| t | trạng thái |
|---|---|
| 4.5s | một vật chứa, churn chạy đều mỗi 0.45s |
| 9.5s | vật cũ **mờ đi**, vật chứa thứ hai **tách bạch bên dưới** đang được chép vào |
| 13.0s | chép xong, hai vật chứa vẫn cùng tồn tại |
| 19.5s | chỉ còn vật mới, **nhỏ hơn hẳn** |

Cái khoá nằm ở **nhịp bị mất**: churn chạy đều tới 5.4s rồi **ngừng hẳn** suốt 10 giây chép,
và chỉ trở lại sau khi xong. Sự đứng im tương phản trực tiếp với churn ở mọi chương khác.

Không hàm ý luôn cần gấp đôi đĩa · không hàm ý VACUUM thường cũng thế · không phải một bảng
thứ hai người dùng thấy được. Đây là **hình học giải thích cho cơ chế viết lại**.

**Hai lỗi đã sửa:**

1. **Hai vật chứa đọc thành một.** Bản đầu đặt vật chứa thứ hai ngay sát dưới vật cũ (cách
   104px) nên nó đọc thành *một lưới cao lên* — mất đúng ý "đĩa thêm". Sửa: khoảng cách 820px
   và vật cũ mờ xuống .38 trong lúc bị đọc.

2. **Một hàng ô không bao giờ bị ẩn.** `oldEls = cells.filter(...)` chụp danh sách **lúc dựng
   timeline**, nhưng các slot sinh ra trong lúc chạy đến từ `tl.call(makeCell)` nên không có
   trong danh sách đó. Một hàng ô cũ sống sót qua cú chuyển. Sửa: mờ **container**, không mờ
   một danh sách đã chụp. Danh sách chụp lúc dựng không bao giờ đúng với một thế giới sinh ra
   lúc chạy.

3. Khung của vật chứa mới lệch 820px so với ô của nó: ô mang `y:820` riêng từng cái, khung
   mang một lần — dịch cả hai cùng một delta là sai. Container về `-820`, khung về `0`.

---

## 5. P5 — CH2 dài 26 giây

**Đạt.** `p5-ch2-26s`. Một con số duy nhất, không nhãn.

| t | trạng thái |
|---|---|
| 3s | 44 sống, 4 hàng, khít |
| 12s | chết rải, 6 hàng |
| 25.8s | vùng gốc gần như chết hết, vùng ghi thêm toàn sống, 8 hàng. **44 sống suốt** |

Thế giới **không thành screensaver**: ba mốc khác hẳn nhau, và trạng thái tích tụ liên tục nên
mắt luôn có thứ để so với lần nhìn trước.

Một quan sát về sự phân tầng nổi lên ở 25.8s — vùng gốc chết dần, vùng ghi thêm toàn sống —
**và nó đúng cơ chế**: với workload của package (mỗi đơn hàng bị UPDATE vài lần), mọi dòng gốc
đều bị cập nhật, phiên bản mới ghi nối đuôi, nên trước khi vacuum chạy thì heap đúng là như
vậy. Đây không phải "vùng chết riêng" mà R4 đã loại — nó là hệ quả, không phải cách bày.

---

## 6. Bất biến VACUUM — kiểm bằng đo, và đã thử ngược

`tools/check-vacuum-invariant.mjs`. Shot khai `vacuum_invariant: { from, to }` là cửa sổ sweep
chạy.

**Bản đầu quét văn bản và sai vì một lý do đáng giữ:** nó cấm `growFrame` trong cả shot, nhưng
`growFrame` **hợp lệ** ở pha churn của chính shot đó — phần cấp phát nở thật khi bên trong hết
chỗ. Bất biến **có biên thời gian**, và biến vòng lặp lên lịch những tween đó không suy ra
được tĩnh. Nên phép kiểm chuyển sang chỗ lời khẳng định thật sự nằm: **artifact đã render**.

Cách đo: khung cấp phát vẽ bằng `--ink-dim` và **không gì khác trong thế giới dùng màu đó**.
Lấy khung hình ở hai đầu cửa sổ dưới dạng raw grey, giữ pixel trong dải luma 130–158, so hộp
bao.

```
✓  p2-threshold-vs-snapshot  9s → 11.6s   biên cấp phát [416..949] × [76..1039] không đổi
```

**Thử ngược** (đặt cửa sổ vào đúng pha churn có nở): thoát mã **1**, báo `949 → 1035`. Chốt
chặn nổ thật.

Phạm vi ghi thẳng trong code: đây **không** phải luật "file quan hệ Postgres không bao giờ co
được" — beat 31 nói VACUUM FULL viết lại bảng và làm file nhỏ lại. Chương viết lại đơn giản là
không khai bất biến này.

**Việc này buộc tách một màu đang mang hai nghĩa.** Khung cấp phát và viền ô trống đang cùng
dùng `--rule-bright` — hai nghĩa một giá trị, đúng lỗi mà chính hợp đồng cấm. Khung chuyển sang
`--ink-dim`. Tách ra cũng chính là thứ làm biên **đo được bằng pixel**.

---

## 7. Hướng bị loại

| hướng | lý do kỹ thuật |
|---|---|
| **cú lùi camera** (P3b) | ô còn 62%, thước không đổi, không thông tin nào thêm — và việc thu nhỏ triệt tiêu một phần tín hiệu lớn lên |
| **ghost mờ** (2px, opacity .5) | render ra gần như không có gì → thế giới đọc thành "tuple bị xoá" trong lúc bản sao đi vắng |
| **hai vật chứa sát nhau** | cách 104px thì đọc thành một lưới cao lên, mất ý "đĩa thêm" |
| **mờ theo danh sách ô chụp lúc dựng** | slot sinh ra lúc chạy không có trong danh sách; một hàng sống sót qua cú chuyển |
| **khung cấp phát dùng chung màu với ô trống** | hai nghĩa một giá trị; và nó chặn luôn khả năng đo biên bằng pixel |
| **quét văn bản cho bất biến VACUUM** | bất biến có biên thời gian; `growFrame` hợp lệ ở pha churn cùng shot |

---

## 8. Mâu thuẫn ngữ nghĩa mới

**Không có.** Một quan sát đã ghi ở §5: sự phân tầng chết-trên / sống-dưới ở cuối P5 là **hệ
quả đúng** của workload package mô tả, không phải một cách bày đơn giản hoá. Nếu Step 5 thấy
nó bị đọc thành "vùng chết riêng" thì đó là vấn đề trình bày, không phải vấn đề sự thật.

---

## 9. Tiếng thật — chưa có

VoiceStudio offline. Hai URL đã biết trả `HTTP 000` ở cả bốn lần thử trong phiên này.

Không sinh được narration, nên **không có** báo cáo timing thật, và §10 không có gì để sửa.

Quy trình khi provider trở lại, đã ghi trong `shot_plan.yaml → timing_status.voice_procedure`:
`namtre_v2`, **không** dùng lại profile id của F01, dựng lại từ công thức bền (clip tham chiếu
+ ref_text trong manifest + instruct), speed **1.00**, seed 1, vi, xác minh **từng segment**
qua provider history. URL lấy từ env.

---

## 10. Timing chương — chưa sửa được

Vẫn là bảng tạm ở `CHAPTER_ARCHITECTURE.md` §9: **163s tạm** so với **157s** package khuyến
nghị. Sáu quyết định đang chờ đo, đứng đầu là ranh giới chương và thời điểm sweep ở CH4.

Bảng `| chương | beat | tạm | lời thật | dư | quyết định |` **chỉ điền được sau khi có tiếng**.
Điền bây giờ là bịa.

---

## 11. Quyết định

**Kiến trúc thị giác: READY_FOR_STEP_5.** Năm rủi ro cao đều đã prototype và đều đạt; bất biến
VACUUM đã có phép kiểm chạy được cả hai chiều; một hướng bị loại bằng đo; không mâu thuẫn ngữ
nghĩa mới. Không có gì trong kiến trúc buộc quay lại Step 4.

**Sản xuất: CHƯA MỞ ĐƯỢC.** Điều kiện tiên quyết còn thiếu đúng một thứ — tiếng thật — và nó
nằm ngoài tầm tay lúc này. Theo đúng ràng buộc đã đặt: không chốt thời lượng chương và không
vào sản xuất trước khi có narration thật.

Cần `VOICESTUDIO_URL` của một runtime đang chạy để đi tiếp.
