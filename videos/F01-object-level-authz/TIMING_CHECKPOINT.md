# F01 — Timing checkpoint: measured narration

Audio thật, không phải ước lượng. Số liệu máy đọc được ở `TIMING_REPORT.yaml`;
tài liệu này là phần lý luận.

## Đã sinh

| | |
|---|---|
| provider | VoiceStudio 0.5.0 · **Tesla T4** · endpoint `trycloudflare.com · sha256:4b6c0afb…` |
| narration | package 004, `sha256 9c961d81…`, 3383 ký tự, 699 âm tiết |
| tham số | `language=vi`, `seed=1`, mọi thứ khác giữ mặc định của provider |
| **audio đo được** | **198.35s** · 35 segment · `sha256 48727372…` |
| kiểm mất chữ | **không có `X-OmniVoice-Dropped-Chunks`** ở bất kỳ segment nào — nếu có, adapter đã dừng và không nối gì |
| kiểm nối | file nối đo được **198.350000s**, khớp đúng tổng 35 header `X-Audio-Duration`. Mọi segment `pcm_s16le / 24000 / mono / 16-bit` nên `-c copy` không tái mã hoá |

### Vì sao sinh theo đoạn

Gửi cả 3383 ký tự trong một request trả **HTTP 524** — Cloudflare quick tunnel bỏ mọi
response từ origin lâu hơn ~100s. Đó là giới hạn của tunnel, không phải của VoiceStudio và
không phải của adapter.

Chuyển sang sinh **theo từng đoạn tác giả** (35 đoạn, 2.16–13.56s). `splitNarration` từ chối
chạy nếu nối các mảnh lại không ra **đúng** văn bản chuẩn — đây là **cắt đoạn, không phải viết
lại**. Không chèn khoảng lặng nào giữa các segment: im lặng giữa hai beat là quyết định của
**video**, đưa nó vào đây là bỏ thời gian bịa vào một phép đo.

Phụ phẩm chính là thứ checkpoint này cần: **thời lượng đo được cho từng beat**, thay vì một
khối 198s phải force-align sau.

---

## Kết quả: kiến trúc hiện tại không chứa nổi narration của nó

**Tổng headroom −31.35s.** Speech 198.35s so với runtime kế hoạch 167s.

| verdict | số shot |
|---|---|
| KEEP | 5 |
| **RETHINK** | **7** |
| SHORTEN | 1 |
| SHIFT_BOUNDARY | 2 |

Hai shot tệ nhất:

- **s14-detection** — 30.2s lời trong 13s khung (**−17.2s**)
- **s02-eliminate** — 26.99s lời trong 13s khung (**−13.99s**)

Và đó chính xác là hai shot mang **nhiều đoạn narration nhất** (s02 sáu đoạn, s14 bốn đoạn).
Tôi đặt thời lượng theo cảm nhận nhịp **hình**, và chưa bao giờ đối chiếu mỗi beat thật sự
gánh bao nhiêu **lời**. Đó là lỗi, và nó chỉ lộ ra khi có audio thật.

**`SHIFT_BOUNDARY` không cứu được.** Nó chỉ sửa mất cân đối *cục bộ* giữa hai shot cạnh nhau —
ở đây đúng một cặp (s05 nhường cho s04). Thiếu hụt này là **toàn cục**, nên dời ranh giới
không tạo thêm được một giây nào.

---

## Đòn bẩy đã đo, không phải giả định

Sinh lại 3 đoạn (137 / 136 / 230 ký tự) ở `speed=1.15`:

| đoạn | 1.0 | 1.15 | tỉ lệ |
|---|---|---|---|
| 8 | 8.20s | 7.16s | 0.873 |
| 19 | 8.20s | 7.16s | 0.873 |
| 31 | 13.56s | 11.80s | 0.870 |

Tỉ lệ **0.872**, lệch dưới 0.4% giữa các đoạn dài ngắn khác nhau → suy ra toàn bộ:
**172.97s**.

### Và 1.15 không phải là "đọc nhanh hơn ý đồ"

| | âm tiết/giây |
|---|---|
| gói **giả định** (699 âm / 166s) | **4.21** |
| đo ở speed 1.0 | 3.52 |
| đo ở speed 1.15 | **4.04** |

Ước lượng 166s của package ngầm giả định ~4.2 âm/s. Giọng này ở tốc độ mặc định đọc **chậm
hơn** giả định đó. `speed=1.15` **trả về đúng nhịp mà package đã tính**, chứ không đẩy quá.

---

## Hai đường đi, và cái giá của mỗi đường

Package tự nêu biên: **đề xuất 170s · tối thiểu 145s · "trên 200 giây là bắt đầu nhắc lại"**.

| | speech | runtime cần (mỗi shot ≥1.2s im lặng có chủ đích) | so với biên của package |
|---|---|---|---|
| **A. giữ speed 1.0** | 198.35s | **~216s** | **vượt trần 200s của chính package** |
| **B. speed 1.15** | 172.97s | **194.5s** | dưới trần, trên đề xuất 170s, trong khoảng cho phép |

Đường A buộc phải bỏ gần hết khoảng lặng để lọt 200s — mà khoảng lặng giải thích là thứ E01 đã
chứng minh là có giá trị.

Đường C — cắt bớt narration — **không tồn tại**: đó là content truth, không phải của tôi.

---

## Quyết định cần bạn xác nhận

Tốc độ đọc ảnh hưởng tới cảm nhận, nên tôi không tự chọn. Đề xuất **B (`speed=1.15`)**, vì nó
khôi phục đúng nhịp mà package đã giả định chứ không phải làm video nhanh hơn ý đồ.

Sau khi chốt, việc còn lại **thuộc Step 4** chứ không phải Step 5: thời lượng của 15 shot và có
thể cả ranh giới shot phải dựng lại theo lời đo được — `s02` gánh 6 đoạn trong một khung 13s và
`s14` gánh 4 đoạn trong 13s, cả hai nhiều khả năng phải **tách**, không chỉ kéo dài.

**Chưa dựng lại 12 shot composition.** Timing checkpoint chưa đóng.
