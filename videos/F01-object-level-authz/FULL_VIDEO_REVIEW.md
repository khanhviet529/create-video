# F01 — Review toàn video, giọng namtre_v2 @ speed 1.00

`output/prototype_17of17_voiced.mp4` · 17 shot · 195.000s · 5850 khung
Tiếng: `voice/narration_timed.wav`, profile **858f5a83 (namtre_v2)**, speed **1.00**, seed 1,
language vi, 35 đoạn — mỗi đoạn xác minh qua `/history` bằng `X-Audio-Id` trước khi ghép.

## 0. Nguồn tiếng

| | |
|---|---|
| lời | **169.12s** (package ước 166s → +3.1s) |
| profile | 858f5a83, dựng từ `giong/namtre_v2.wav` 5.36s; `ref_text` server trả về khớp manifest **từng byte** |
| tham số | speed 1.00 · seed 1 · vi — **cả ba lấy từ `shot_plan.yaml`**, không lấy từ dòng lệnh |
| xác minh | 35/35 cùng `profile_id`, 0 thiếu `audio_id`, 0 duration ≤ 0, 0 dropped chunk |

speed 1.15 đã bị loại. Nó là phép bù cho **giọng mặc định** của provider, vốn chậm hơn nhịp
package giả định. namtre_v2 ở 1.00 nói 4.11 âm/s so với 4.21 âm/s package giả định — không
còn gì để bù. Chi tiết đo ở `VOICE_CALIBRATION.md`.

## 1. Đo

**Nhịp hình theo tiếng.** 35/35 đoạn đều có chuyển động bắt đầu trong cửa sổ của nó (cho
phép dẫn trước 0.35s). Hình 195.000s / tiếng 195.000s.

**Match cut** — đo bằng PNG, vì nén h264 một mình đã đẩy YMAX lên ~120 trên hai khung giống
hệt nhau:

| | YMAX | YAVG |
|---|---|---|
| `s03-authored-a` → `s04-authored-b` | **0** | **0** |
| `s10-invariant` → `s11-inherit` | **0** | **0** |

**Không khung chết.** Quét 2 khung/giây: mực trung bình 2.56 trên nền, thấp nhất 1.00, không
quãng nào dưới 0.35.

**Khoảng lặng.** 25.0s trên 195s (12.8%), toàn bộ ở cuối shot trên một khung vừa hoàn thành.
Dài nhất **2.98s** (`s15-question`) — dưới ngưỡng 3.0s. Thiết kế cũ là 21.3s; chênh 3.7s rải
trên 17 shot.

| shot | khung | lời | giữ | | shot | khung | lời | giữ |
|---|---|---|---|---|---|---|---|---|
| s01-leak | 7 | 5.13 | 1.87 | | s10-invariant | 8 | 6.41 | 1.59 |
| s02-guess | 16.5 | 15.13 | 1.37 | | s11-inherit | 17.5 | 15.75 | 1.75 |
| s02-eliminate | 9.5 | 8.24 | 1.26 | | s12-cost | 12 | 10.69 | 1.31 |
| s03-authored-a | 11 | 9.20 | 1.80 | | s13-scope-limits | 7 | 5.76 | 1.24 |
| s04-authored-b | 21.5 | 19.87 | 1.63 | | s14-signal | 13 | 11.76 | 1.24 |
| s05-response | 3 | 1.89 | 1.11 | | s14-limits | 16 | 13.60 | 2.40 |
| s06-cadence | 20.5 | 18.82 | 1.68 | | s15-question | 7.5 | 4.52 | **2.98** |
| s07-name | 7.5 | 6.86 | 0.64 | | | | | |
| s08-not-id | 11.5 | 10.61 | 0.89 | | | | | |
| s09-not-a-line | 6 | 4.88 | 1.12 | | | | | |

## 2. Chỉnh nhịp — bốn shot, không phải mười bảy

Đối chiếu beat cũ với beat mới cho thấy **chỉ một shot thật sự lệch**. Beat dịch phần lớn
0.00–0.15s; lớn nhất là `s14-limits` beat 3 (−0.98s) và `s06` (−0.3s).

Quy tắc đã dùng: dịch mỗi tween theo đúng độ dịch của beat mà nó nằm trong, để giữ nguyên
khoảng cách giữa từng chuyển động và chữ nó thuộc về. **Chỉ chạm beat dịch từ 0.15s trở lên**
— dưới mức đó, phần hiệu chỉnh còn nhỏ hơn chính cái ease sẽ áp lên nó.

| shot | chỉnh |
|---|---|
| `s04-authored-b` | 4 tween trong beat 4–5, dịch −0.16 và −0.49 |
| `s06-cadence` | 11 tween trong beat 2–4, dịch −0.27 tới −0.32 |
| `s14-limits` | 8 tween trong beat 2–3, dịch −0.32 và −0.98 |
| `s10-invariant` | tắt transient 6.95 → 6.60; lời kết thúc sớm hơn 0.34s nên khung s11 mở lên có 0.90s lắng thay vì 0.55s |

**Bố cục không đổi ở shot nào.** Kiến trúc 17 shot / 195s giữ nguyên: không biên shot nào
dịch, không hold nào vượt ngưỡng.

### Một hỏng hóc do chính lượt chỉnh gây ra

Regex dịch tween bắt cả `pathEls.slice(0, 2)` trong `s06`, biến nó thành `slice(0, 1.69)`.
`Array.slice` cắt phần thập phân, nên bảng đếm sẽ chỉ hiện **một** đường thay vì hai — và
`cv gate` sẽ báo sạch, vì không checker nào biết bảng đó phải có mấy hàng. Bắt được nhờ đọc
log dịch thấy `2→1.69` xuất hiện hai lần ở một shot chỉ có bốn beat. Đã sửa, và soát lại cả
ba shot cho mọi con số không phải thời điểm tween. Mốc gốc vòng lặp `const t = 12.20 + k *
1.30` thì regex không với tới và phải sửa tay.

## 3. Giới hạn

**Chưa nghe được.** Track đúng file, đúng độ dài, đúng sha256 của narration package 004, 35
đoạn cùng một giọng đã xác minh, và mọi nhịp hình rơi trong cửa sổ đoạn thoại tương ứng.
Nhưng chất giọng và cảm giác khớp khi nghe liên tục thì phải nghe.

`full_video_review` để `pending_listen`, chưa tạo `final.mp4`.
