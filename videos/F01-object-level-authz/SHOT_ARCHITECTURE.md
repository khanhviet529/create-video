# F01 — Shot Architecture (revised against measured audio)

**17 shot · 195s · lời 173.7s · headroom 21.3s · 17/17 KEEP**

Dựng từ **lời đo được**, không phải từ ước lượng 166s của package. Composition Architecture
giữ nguyên; đây là bản sửa **thời lượng và ranh giới**, không phải sửa ngữ pháp không gian.

Đọc kèm: [COMPOSITION_ARCHITECTURE.md](COMPOSITION_ARCHITECTURE.md) ·
[TIMING_CHECKPOINT.md](TIMING_CHECKPOINT.md) · `TIMING_REPORT.yaml` · `VOICE_PROVENANCE.yaml`

---

## Hiệu chỉnh giọng — của riêng video này

| | |
|---|---|
| `speed` | **1.15** · `language=vi` · `seed=1` |
| lời đo được | **173.7s** (dự đoán từ tỉ lệ 0.872 là 172.97s — lệch 0.4%) |
| nhịp âm tiết | 4.04 âm/s · package ngầm giả định 4.21 · giọng ở mặc định chỉ 3.52 |

`speed 1.15` **khôi phục nhịp package đã tính**, không phải đẩy nhanh hơn ý đồ. Ghi trong plan
là `voice_calibration.scope: this_video_only` — **không phải mặc định mới**. Giọng khác hoặc
package khác phải đo lại từ đầu.

---

## Hai chỗ tách, và cả hai rơi đúng ranh giới operation đã có sẵn

Hai shot vỡ nặng nhất ở checkpoint không phải vì quá ngắn, mà vì **mỗi shot đang làm hai việc
trong một khung** — chính điều đó khiến chúng vừa quá tải lời vừa lẫn lộn về composition:

| cũ | lời | tách thành | operation |
|---|---|---|---|
| `s02-eliminate` | 23.62s / 6 đoạn | `s02-guess` (đoạn 2–5) + `s02-eliminate` (6–7) | **accumulation** rồi **narrowing** |
| `s14-detection` | 26.38s / 4 đoạn | `s14-signal` (31) + `s14-limits` (32–34) | **counting** rồi **narrowing** |

`s02` trước đây vừa nêu giả thuyết, vừa chất bằng chứng, vừa gạch bỏ — ba việc. Giờ: một shot
để **niềm tin đứng yên trong khi bằng chứng chất quanh nó**, một shot để **gạch**.

`s14` trước đây vừa đếm route vừa liệt kê giới hạn — hai universe trong một khung, đúng cái
`p4-limits` đã bị loại vì nó. Giờ chúng bị tách bởi **một cú cắt**, và luật "không dùng chung
baseline" của họ `counting` nâng lên thành luật **giữa hai shot**: `s14-limits` không được tái
dùng lưới của `s14-signal`. Tách ra làm luật đó mạnh hơn khi còn chung khung.

---

## 17 shot

`head` = im lặng có chủ đích quanh lời. Không phân bổ đều — đó mới là nén cơ học.

| # | id | đoạn | lời | thời lượng | head | operation | composition |
|---|---|---|---|---|---|---|---|
| 1 | `s01-leak` | 1 | 5.50 | 7.0 | 1.50 | inspection | dựng lại |
| 2 | `s02-guess` | 2–5 | 15.35 | 16.5 | 1.15 | accumulation | **mới** |
| 3 | `s02-eliminate` | 6–7 | 8.27 | 9.5 | 1.23 | narrowing | dựng lại |
| 4 | `s03-authored-a` | 8–9 | 9.48 | 11.0 | 1.52 | accumulation (code) | **giữ** |
| 5 | `s04-authored-b` | 10–14 | 20.36 | 21.5 | 1.14 | comparison (code) | **giữ** |
| 6 | `s05-response` | 15 | 1.97 | 3.0 | 1.03 | inspection | dựng lại |
| 7 | `s06-cadence` | 16–19 | 19.13 | 20.5 | 1.37 | counting | dựng lại |
| 8 | `s07-name` | 20 | 6.87 | 7.5 | 0.63 | naming | dựng lại |
| 9 | `s08-not-id` | 21–23 | 10.65 | 11.5 | 0.85 | narrowing | dựng lại |
| 10 | `s09-not-a-line` | 24 | 5.19 | 6.0 | 0.81 | narrowing | dựng lại |
| 11 | `s10-invariant` | 25 | 6.75 | 8.0 | 1.25 | transformation | dựng lại |
| 12 | `s11-inherit` | 26–28 | 16.16 | 17.5 | 1.34 | accumulation (code) | **giữ** |
| 13 | `s12-cost` | 29 | 10.92 | 12.0 | 1.08 | accumulation | dựng lại |
| 14 | `s13-scope-limits` | 30 | 5.85 | 7.0 | 1.15 | narrowing | dựng lại |
| 15 | `s14-signal` | 31 | 11.80 | 13.0 | 1.20 | counting | dựng lại |
| 16 | `s14-limits` | 32–34 | 14.58 | 16.0 | 1.42 | narrowing | **mới** |
| 17 | `s15-question` | 35 | 4.87 | 7.5 | **2.63** | hold | dựng lại |

Biên độ **3.0s – 21.5s**. Phủ đoạn 1–35, không trùng không thiếu; `time` liên tục 0→195.

### Im lặng được gán theo việc, không theo công thức

- **0.63–0.85s** ở `s07`, `s08`, `s09` — đặt tên và hai lời **từ chối**. Giữ lâu một lời phủ
  định là mời người xem cân nhắc lại nó.
- **1.5s** ở `s03` — câu *"và đến hôm nay vẫn đúng"* phải đọng, vì nó được **mang sang** `s04`
  qua match cut và là thứ giữ cho cơ chế không sụp thành "ai đó viết code tệ".
- **2.63s** ở `s15` — dài nhất video. Luật composition của họ `hold` là **để trường mở**; một
  câu hỏi chưa trả lời không thể bị cắt ngay sau dấu chấm.

---

## Cái gì KHÔNG đổi

- **Composition Architecture** — tám họ và ba mệnh đề (a) khối lượng ở đâu (b) neo dọc
  (c) khoảng trống nghĩa là gì. Hai shot mới nhận họ có sẵn: `s02-guess` → accumulation,
  `s14-limits` → narrowing.
- **`s03` / `s04` / `s11`** — vật liệu là code, flush-left là earned, và **match cut 03→04 đã
  đo được YMAX = 0**. Chỉ đổi thời lượng, không đụng composition.
- **Narration** — không sửa một chữ. 35 đoạn nối lại vẫn đúng byte với văn bản chuẩn;
  `splitNarration` từ chối chạy nếu không.
- **Semantic model, camera (17/17 tĩnh), logic chuyển cảnh.**

## Phân bố họ operation sau khi tách

`narrowing 5` · `code_author 3` · `inspection 2` · `accumulation 2` · `counting 2` ·
`naming 1` · `transformation 1` · `hold 1`

`narrowing` là họ đông nhất (5). Đó là hình dạng thật của video: nó **thu hẹp hai lần** —
một lần trên nguyên nhân (`s02-eliminate`), một lần trên cách sửa (`s08`, `s09`) — rồi thu hẹp
chính lời khẳng định của mình hai lần nữa (`s13`, `s14-limits`). Step 5 phải phân biệt bốn chỗ
đó bằng **cái gì co lại**, không bằng nội dung chữ.

---

**Kiến trúc ổn định: 17/17 KEEP.** Bước tiếp theo là Step 5 — dựng lại **14 shot** theo
composition family và thời lượng đo được. `s03`, `s04`, `s11` chỉ cần chỉnh thời lượng.
