# H01 — bản có giọng + voiced review

`output/BEAT_ANCHORED_RETIMED.mp4` · **168.53s · 5055 khung · 1080×1920 · có audio stream**
Giọng `namtre_v2` @ speed 1.00, seed 1, vi · 39/39 segment, xác minh hai bằng chứng độc lập.
Track `voice/narration_timed.wav` 168.533s · `sha256 5919badb…`, ghim trong `shot_timing.json`.

---

## Chẩn đoán 8 chương — XÁC NHẬN một phần, BÁC một phần

Cách đọc của reviewer đúng về nguyên tắc, nhưng **mẫu số sai**: phải so cụm sự kiện với **số
beat của chính chương**, không với nhịp trung bình toàn bài (4.3s).

| chương | beat | cụm | cụm/beat | beat dài nhất | beat KHÔNG có sự kiện | bệnh |
|---|---|---|---|---|---|---|
| ch1-su-co | 7 | 4 | **0.57** | beat 6 = 5.2s | 2, 4, 6, 7 | **thiếu** |
| ch2-co-che | 5 | 6 | 1.20 | beat 12 = 7.9s | — | phân bố |
| ch3-cua-so | 3 | 3 | 1.00 | **beat 14 = 8.8s** | — | phân bố |
| ch-aha | 4 | 4 | 1.00 | beat 19 = 3.2s | 17 *(cố ý — R18)* | phân bố |
| ch4-bao-dam | 5 | 4 | **0.80** | beat 21 = 7.0s | 23, 24 | **thiếu** |
| ch-bon-vi-tri | 9 | 11 | 1.22 | **beat 30 = 8.6s** | — | phân bố |
| ch-do-luong | 5 | 9 | 1.80 | beat 37 = 5.7s | — | phân bố |
| ch5-cau-hoi | 1 | 2 | 2.00 | beat 39 = 6.9s | — | phân bố |

**Xác nhận:** `ch-bon-vi-tri` bệnh phân bố (1.22) · `ch1-su-co` bệnh thiếu (0.57) — cả hai đúng
như reviewer đọc.

**Bác:** `ch3-cua-so` **không** phải bệnh thiếu dù 4.6 s/cụm > nhịp 4.3s — nó có **3 beat, 3
cụm**, đủ một cụm mỗi beat.

**Thêm:** `ch4-bao-dam` cũng bệnh thiếu (0.80) — reviewer chưa nêu.

**Và một tầng chưa ai nêu:** hai beat **riêng lẻ** dài **8.8s** và **8.6s** (beat 14, beat 30)
cần **≥ 2 cụm mỗi beat**. Đó là bệnh mật độ **ở mức beat**, không ở mức chương — một chương có
1.22 cụm/beat vẫn chứa được một beat trống 8.6s.

---

## Chữa theo bệnh

### Bệnh phân bố → đặt lại vị trí, không thêm gì

Ánh xạ **tuyến tính từng khúc**, neo ở **mọi mốc beat**: từ mốc tác giả (đọc từ comment beat
trong generator) sang mốc **thật** (đo từ 39 wav). Chỉ dịch **vị trí**; `duration` từng tween
giữ nguyên, nên sự kiện rơi muộn hơn mà mỗi sự kiện vẫn ở nhịp của chính nó.

```
ch1-su-co       14s → 24.18s   ( 9 vị trí)     ch4-bao-dam     18s → 23.46s   (13 vị trí)
ch2-co-che      17s → 21.86s   (12 vị trí)     ch-bon-vi-tri   30s → 45.19s   (26 vị trí)
ch3-cua-so      12s → 13.86s   ( 6 vị trí)     ch-do-luong     17s → 21.69s   (15 vị trí)
ch-aha          15s → 11.35s                   ch5-cau-hoi      8s →  6.86s   ( 2 vị trí)
──────────────────────────────────────────────────────────────────────────────────────────
tổng hình 168.45s  =  lời 168.45s     lệch 0.00s
```

Guard của hàm map **nổ đúng một lần**: `ch3-cua-so` có sự kiện ở 0.4s, trước mốc tác giả đầu
tiên (1.6s), nên map trả **−1.2s** và regex `\d+` không khớp số âm. Kẹp về ≥ 0. Guard làm việc,
không phải guard sai.

Lệch 83ms giữa hình và lời sau khi lắp là **lượng tử hoá khung 30fps** (mỗi chương làm tròn lên
khung nguyên), không phải drift — đệm đúng 0.083s lặng vào đuôi track.

### Bệnh thiếu → ĐÚNG MỘT thay đổi trạng thái thật, mỗi chương

**ch1 · beat 7** — *"Không node nào hỏng. Cả hai đang trả lời đúng câu hỏi được đặt cho chúng."*
Hai vạch dưới hai ô đọc sáng lên **đồng thời và giống nhau**. Sự đồng thời và sự giống nhau
**chính là** khẳng định. Vật đã có từ beat 1 (`.rule2`) — không thêm từ vựng, không thêm vật.

**ch4 · beat 23** — *"Thêm replica MUA thêm khả năng đọc. Thứ đem ĐỔI là read-your-writes."*
Thứ mua được (tầm với của replica) sáng lên, rồi thứ đem đổi (khoảng chênh) sáng lên — đúng hai
nửa của câu, trên hai vật đã có.

**Cố ý KHÔNG thêm gì ở beat 6 của ch1** (*"Kiểm cache… Kiểm log ghi: commit thành công"*): beat
này **loại hai lời giải thích**, và trên màn hình **không gì đổi** khi loại một ứng viên. Đó
chính là lý do đội đi tìm sai chỗ. Khoảng giữ có lý do, không phải chỗ thiếu.

---

## Voiced review

### A · 16 khoảng giữ > 3.0s, và beat nào đang nói

| khoảng | dài | beat | justify |
|---|---|---|---|
| 1.8→5.3 | 3.5s | 1 | ✓ bình luận, hệ đang chạy tốt |
| 6.5→12.3 | 5.8s | 3 | **✗** beat có bốn hành động (lưu · báo đã lưu · F5 · giá trị cũ) mà chỉ một cụm |
| 13.8→20.8 | 7.0s | 5 | ✓ ô primary đã hiện và **cố ý** không đổi — đó là stale ≠ lost |
| 20.8→24.3 | 3.5s | 7 | ✓ ngay sau sự kiện hai vạch |
| 34.3→38.3 | 4.0s | 11 | ✓ cấu hình đứng chính là khẳng định |
| 39.5→46.0 | 6.5s | 12 | ✓ trước cú "đầu mút tới muộn" |
| **50.3→60.0** | **9.8s** | 14 | **✗** beat dài 8.8s, một cụm |
| 60.0→65.3 | 5.3s | 16 | ✓ **cố ý** — R18, hình im lặng về hệ quy chiếu |
| 72.3→76.8 | 4.5s | 20 | ✓ bằng chứng là quan hệ **TĨNH** (LAW-2 chiều dương) |
| 78.0→83.5 | 5.5s | 21 | ✓ trước cú EC hoàn tất |
| 102.3→105.8 | 3.5s | 27 | ✓ bình luận về cái giá của V1 |
| **116.0→124.3** | **8.3s** | 30 | **✗** beat dài 8.6s, một cụm |
| 131.0→135.0 | 4.0s | 32 | ✓ V4 = **không vẽ gì**; đứng yên LÀ nội dung |
| 135.8→140.0 | 4.3s | 33 | ✓ trước câu đọc thứ hai |
| 157.8→161.8 | 4.0s | 38 | ✓ **cố ý** — R12, không gì tiến LÀ nội dung |
| 164.8→168.0 | 3.3s | 39 | ✓ giữ cuối |

**Ba khoảng không justify được:** beat 3 (5.8s), beat 14 (9.8s), beat 30 (8.3s). Cả ba là bệnh
**mật độ ở mức beat** — đúng thứ cổng ngân sách beat vừa được lập để chặn.

### B · hình đến lệch lời

Lệch |>2.0s| chỉ **hai beat**: beat 15 **+2.62s**, beat 17 **+2.47s**, cả hai *hình đến sau lời*
và cả hai là hệ quả của beat dài ngay trước (14 và 16). Mọi beat khác trong ±2.0s.

### C · TỔNG THỜI GIAN GIỮ — **KHÔNG ĐẠT**. Phát hiện chính của lượt này.

```
G01  175.5s · giữ  79.8s = 45.4%  · khoảng dài nhất 4.75s   (đã qua full-video review)
H01  168.5s · giữ 126.0s = 74.8%  · khoảng dài nhất 9.75s
→ H01 giữ NHIỀU HƠN G01  29.3 điểm %
```

Ngưỡng tôi tự khai là 12 điểm %. **Vượt 2.4 lần.** Đúng rủi ro §4 nêu — *"F01 lần nữa, tĩnh"* —
và giờ là một con số, không phải một lo ngại.

*(Bản đầu của bộ kiểm in cảnh báo này rồi vẫn kết "mọi mục ĐẠT" vì mục đó không `fail++`. Một
bộ kiểm tự khai ngưỡng mà không tính vào verdict là **pass gây nhầm** — đã sửa, giờ verdict là
**1 mục KHÔNG ĐẠT**.)*

**Nguyên nhân là CẤU TRÚC:** vị từ của thế giới H01 là **bao hàm** — một **quan hệ**. Một quan
hệ được cho thấy bằng một **cấu hình**, và cấu hình không chuyển động. G01 có vị từ **độ chiếm /
phạm vi** — một **quá trình**, nên thế giới nó động liên tục.

> **Mở rộng LAW-2:** vị từ của một thiết bị không chỉ quyết định nó dạy được LOẠI QUAN HỆ nào —
> nó còn quyết định thiết bị đó chở được **BAO NHIÊU CHUYỂN ĐỘNG** một cách trung thực.
> Vị từ tĩnh ⇒ thế giới tĩnh.

Và biểu diễn động duy nhất từng có cho 007 — trường hai trục, nơi đường node tiến liên tục — đã
bị **LAW-1** giết. Nên H01 động đúng bằng mức mà biểu diễn trung thực của nó cho phép.

### D · bốn lock trên bản có giọng — **cả bốn ĐẠT**

| lock | đo ở đâu | kết quả |
|---|---|---|
| replica chậm | độ dày hai thanh, **ba** cột xa chốt | `4/4` ở x=300, 450, 600 → không xếp hạng hai node |
| mất dữ liệu | pixel đỏ trội quanh dấu commit, **7 mốc** trên bản đã ghép | **0** ở cả 7 |
| eventual consistency vỡ | đầu mút dưới, cửa sổ beat 21 | `617 → 802`, dịch **185px** → EC được cho thấy HOÀN TẤT |
| một fix đúng | phạm vi đường lịch sử, 4 mốc trong ch-bon-vi-tri | `170..909` không đổi → bốn vị trí cùng một tỉ lệ |

---

## Phán quyết

**Bản có giọng TỒN TẠI và đúng về kỹ thuật:** timing khớp beat (tổng lệch 0.00s, từng beat
≤ 2.62s), bốn lock đạt, không dropped chunk, một giọng duy nhất đã xác minh hai chiều.

**KHÔNG chặn lại.** Nó không tệ hơn không có bản nào — nó là artifact thật, và chính nó là thứ
phơi ra con số 74.8%.

**Nhưng KHÔNG đạt chuẩn để đi tiếp,** vì một mục: **74.8% vs 45.4%**. Ba chỗ cụ thể phải chữa
là beat 3, 14, 30 — chữa bằng **mật độ ở mức beat**, không bằng retiming, và **không bằng chuyển
động lấp**.

**Một câu hỏi cần reviewer quyết, tôi không tự mở:** beat 38 nói *"primary đang rảnh"* như một
**ngoại lệ**, tức ngầm hiểu bình thường log **vẫn đang tiến**. Nếu điều đó cho phép hiện dòng
WAL tiến liên tục ở nền, thế giới H01 sẽ có chuyển động **trung thực** liên tục — đúng cách G01
có churn, và nó sẽ hạ 74.8% một cách chính đáng chứ không phải bằng trang trí. Nhưng đó là một
**suy luận từ một ngoại lệ**, không phải câu package nói thẳng.

---

## Lệnh tái lập

```
node tools/cv.mjs compose H01-two-meanings-of-after
node tools/review-h01-mute.mjs
node tools/review-h01-voiced.mjs
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 videos/H01-two-meanings-of-after/output/BEAT_ANCHORED_RETIMED.mp4
```
