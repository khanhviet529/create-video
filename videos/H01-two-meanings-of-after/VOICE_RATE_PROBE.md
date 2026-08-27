# H01 · nhánh A — đo tốc độ giọng thật

Phạm vi: **sinh + đo**. Không voiced review, không chốt timing. 5 beat, không phải 39.

---

## Tới bước nào

**Đủ 6/6 bước.** Không chết giữa chừng lần này.

| bước | kết quả |
|---|---|
| 1 · `/health` | `{"status":"ok","device":"cuda (Tesla T4)","version":"0.5.0"}` |
| 2 · profile từ recipe bền | `b1aeb993 (da co)` — **runtime cũ vẫn sống**, chỉ tunnel trước đã chết |
| 3 · sinh 5 beat | 5/5 · HTTP 200 · RIFF/WAVE hợp lệ · không dropped chunk |
| 4 · xác minh profile | xem dưới — bằng chứng, không phải HTTP 200 |
| 5 · đo tốc độ thật | **4.18 âm/giây** |
| 6 · ngoại suy 711 âm tiết | **170.0s** |

**Chỉnh một câu tôi đã nói lượt trước:** tôi viết *"`b1aeb993` đã chết cùng runtime"*. Sai —
`bao-dam` trả về `(da co)`, nên **runtime không chết, chỉ tunnel chết**. Profile ephemeral theo
runtime, không theo tunnel.

---

## Bước 4 · xác minh profile — bằng chứng, không phải HTTP 200

`/generate` **không bao giờ** nói nó dùng giọng nào, và một `profile_id` lạ bị **bỏ qua lặng lẽ**
rồi sinh bằng giọng mặc định, vẫn trả 200 (`generation.py`: `if profile_id:` → `if row:` không
có `else`). Nên HTTP 200 không chứng minh gì. Hai bằng chứng độc lập:

**(i) `/history`** — `X-Audio-Id` **chính là** `generation_history.id`:

```
✓ beat 12 · id a08f8e25 · profile_id b1aeb993 · seed 1 · lang vi
✓ beat 19 · id 8e0bee10 · profile_id b1aeb993 · seed 1 · lang vi
✓ beat 30 · id 4ceb7876 · profile_id b1aeb993 · seed 1 · lang vi
✓ beat 36 · id b41861da · profile_id b1aeb993 · seed 1 · lang vi
✓ beat 39 · id 14ea059c · profile_id b1aeb993 · seed 1 · lang vi

tập profile_id của 5 segment: {b1aeb993} → MỘT GIỌNG DUY NHẤT
```

**(ii) `/profiles/b1aeb993` so với công thức bền** — đóng nốt chuỗi *"id này có thật là
namtre_v2 không"*:

| | |
|---|---|
| `name` | `namtre_v2` |
| `ref_text` | **khớp từng byte** với `giong/manifest.json` |
| `instruct` | **khớp từng byte** với `instruct_goc` của manifest |

*(Lần chạy đầu báo `instruct: KHÔNG` — script tôi đọc sai tên trường (`instruct` thay vì
`instruct_goc`). Lỗi ở dụng cụ, không ở dữ liệu.)*

---

## Bước 5 · tốc độ thật

**Phương pháp đếm âm tiết được KIỂM trước khi dùng:** tiếng Việt đơn âm tiết theo chính tả nên
số âm tiết ≈ số token phân cách bằng khoảng trắng. Tổng đếm được **711 = 711** mà package khai,
**lệch 0%** — nên số theo beat so được thẳng với con số của package.

**5 beat đại diện**, chọn theo độ dài và mật độ thuật ngữ, **không chọn beat ngắn nhất**:

| beat | âm tiết | thuật ngữ | thời lượng | âm/giây |
|---|---|---|---|---|
| 12 · doc-nặng, dài | 29 | 6 | 7.87s | **3.68** ← chậm nhất |
| 19 · ngắn, không thuật ngữ | 14 | 0 | 3.15s | 4.44 |
| 30 · dài nhất, kỹ thuật nhất | 35 | 8 | 8.65s | 4.05 |
| 36 · vừa, kỹ thuật | 22 | 3 | 4.56s | **4.82** ← nhanh nhất |
| 39 · câu hỏi đóng | 30 | 3 | 6.86s | 4.37 |

```
gộp: 130 âm tiết / 31.09s = 4.18 âm/giây     (18.3% toàn bài)
trải theo beat: 3.68 – 4.82
```

Thời lượng đo bằng `ffprobe` **trên wav đã nhận**, không lấy `X-Audio-Duration` từ header
(số provider tự khai) và không lấy thời gian tường (beat 12 mất 68.9s vì cold load).

---

## Bước 6 · ngoại suy cho 711 âm tiết

```
ở tốc độ đo được (4.18)   = 170.0s   ←
ở beat nhanh nhất (4.82)  = 147.4s
ở beat chậm nhất  (3.68)  = 193.0s
─────────────────────────────────────
dải F01, 4.7 âm/s         = 151.3s
package khai (4.21)       = 169.0s
dải F01, 4.0 âm/s         = 177.8s
```

> **170.0s — nằm trong dải 151–178s, và lệch số khai 169s đúng 1.0s (0.6%).**

---

## Có cần recalibrate không? **KHÔNG**

`namtre_v2 @ speed 1.00` đo ra **4.18** so với giả định **4.21** của package — lệch **0.7%**.
Recalibrate ở mức đó là **chỉnh không có nguyên nhân**, đúng thứ §4 cấm.

## Ba điều phải nói kèm, không được bỏ

1. **5 beat = 18.3% toàn bài, và trải theo beat rất rộng (3.68–4.82).** Con số gộp khớp gần như
   hoàn hảo với số khai, nhưng **một bộ 5 beat khác có thể ra khác**. 170.0s là *ước lượng tốt
   nhất hiện có*, không phải phép đo toàn bài.
2. **Khoảng lặng đầu/cuối chiếm 17.9% của 5 segment rời.** Cắt sát thì tốc độ thành 5.10 âm/giây
   và ngoại suy còn 139.5s. Con số đó **không dùng được** cho bản dựng thật, vì bản thật ghép 39
   segment mỗi cái mang một cặp khoảng lặng — tức 170.0s mới là ước lượng đúng cho track ghép
   sát. Cộng thêm phần giữ giữa các chương thì tổng sẽ **cao hơn 170s**.
3. **KHÔNG chốt timing.** Báo số, chờ review.
