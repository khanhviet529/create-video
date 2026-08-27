# H01 — VALIDATION NOTES

Bản ghi các đại lượng đã đo trên artifact có giọng, kèm cách đọc chúng. Mỗi con số đi với lệnh
tái lập được. Không có mục nào ở đây là lời xin lỗi; những mục là **khuyết điểm** được gọi là
khuyết điểm, những mục là **hệ quả của vị từ** được gọi đúng như vậy.

Artifact: `output/BEAT_ANCHORED_RETIMED.mp4` · `sha256:4c3077f7149c8cb2…` · 168.53s · 5055 khung
· audio 168.533s.

---

## 1 · TỈ LỆ GIỮ 74.3% — KHÔNG PHẢI KHUYẾT ĐIỂM

```
node tools/review-h01-voiced.mjs        # mục C
```

```
G01  175.5s · giữ  79.8s = 45.4% · khoảng dài nhất 4.75s
H01  168.5s · giữ 125.3s = 74.3% · khoảng dài nhất 7.00s
```

**Vì sao hai con số này không so được với nhau.** G01 chở vị từ **QUÁ TRÌNH** — bloat lớn dần —
nên nó chở được chuyển động liên tục một cách trung thực: mỗi khoảnh khắc thật sự có một lượng
mới. H01 chở vị từ **QUAN HỆ** — bao hàm tiền tố — và một quan hệ là một **CẤU HÌNH**. Khi hai
tiền tố đã ở đúng vị trí, quan hệ đã được phát biểu xong; hình đứng không phải hình chết, mà là
hình đã nói hết điều vị từ nói.

Hai tỉ lệ giữ mang hai vị từ khác loại **không phải hai giá trị của cùng một đại lượng**, nên
hiệu 28.9 điểm % không phán quyết được gì. Ngưỡng "12 điểm %" mà `review-h01-voiced.mjs` từng tự
khai đã bị **RÚT** ở lượt 11, và việc rút được khai ngay trong header của bộ kiểm cùng lý do —
không phải xoá `fail++` rồi im. Xem `creative_memory/LAW-device-predicate-motion-budget.md` và
`creative_memory/METHOD-measure-the-claim.md` §"Ngưỡng tự khai mà SAI thì phải RÚT".

**Bằng chứng ngược, đo được.** Cách rõ ràng nhất để hạ tỉ lệ giữ là cho WAL chạy liên tục ở nền.
Làm vậy thì hình phát biểu "replica đang chạy đuổi một mục tiêu di động" = **"replica chậm"** =
đúng thứ **LOCK-A** cấm. Chuyển động thêm vào một vị từ quan hệ không trung tính; nó phát biểu
một vị từ khác. Nên câu **KHÔNG thêm chuyển động ở đâu khác để hạ %** không phải một sự nhân
nhượng — nó là điều kiện để bốn lock còn đứng.

**Cái phán quyết được** là từng khoảng giữ có chính đáng hay không, trên từng beat. Bảng ở §2.

## 2 · 17 KHOẢNG GIỮ > 3.0s, từng khoảng đối chiếu beat đang nói

```
node tools/review-h01-voiced.mjs        # mục A
```

| khoảng | dài | beat | đọc thế nào |
|---|---|---|---|
| 1.8→5.3 | 3.5s | 1 | ✓ bình luận, hệ đang chạy tốt |
| 8.8→12.3 | 3.5s | 3 | ✓ **đã sửa lượt 11** — refresh tách hai bước, quãng trống LÀ round trip |
| 13.8→20.8 | 7.0s | 5 | ✓ **cố ý** — ô primary đã hiện và không đổi: stale ≠ lost |
| 20.8→24.3 | 3.5s | 7 | ✓ ngay sau sự kiện hai vạch |
| 34.3→38.3 | 4.0s | 11 | ✓ cấu hình đứng chính là khẳng định |
| 39.5→46.0 | 6.5s | 12 | ✓ trước cú "đầu mút tới muộn" |
| 49.0→53.3 | 4.3s | 14 | ✓ **đã sửa lượt 11** — mốc đầu của khoảng B |
| 54.0→60.0 | 6.0s | 15 | ✓ **cố ý** — xem §3, khoảng mới lộ ra |
| 60.0→65.3 | 5.3s | 16 | ✓ **cố ý** — R18, hình im lặng về hệ quy chiếu |
| 72.3→76.8 | 4.5s | 20 | ✓ bằng chứng read-your-writes là quan hệ **TĨNH** (LAW-2 chiều dương) |
| 78.0→83.5 | 5.5s | 21 | ✓ trước cú EC hoàn tất |
| 102.3→105.8 | 3.5s | 27 | ✓ bình luận về cái giá của V1 |
| 116.0→120.8 | 4.8s | 30 | ✓ **đã sửa lượt 11** — vòng mở ra và GIỮ: commit chưa trả về |
| 131.0→135.0 | 4.0s | 32 | ✓ V4 = **không vẽ gì**; đứng yên LÀ nội dung |
| 135.8→140.0 | 4.3s | 33 | ✓ trước câu đọc thứ hai |
| 157.8→161.8 | 4.0s | 38 | ✓ **cố ý** — R12, không gì tiến LÀ nội dung |
| 164.8→168.0 | 3.3s | 39 | ✓ giữ cuối |

**Số khoảng TĂNG từ 16 lên 17 trong khi khoảng dài nhất GIẢM từ 9.75s xuống 7.00s.** Đây là điều
phải xảy ra: chia một khoảng 9.8s bằng một cụm ở giữa cho ra hai khoảng, và cả hai nửa vẫn có thể
> 3.0s. Đếm số khoảng là mẫu số sai cho câu hỏi "có beat nào bị bỏ rỗng không".

| beat | trước lượt 11 | sau |
|---|---|---|
| 3 | 5.8s, một cụm cho bốn hành động | **3.5s** — hai cụm: giá trị rời đi, rồi giá trị cũ về |
| 14 | 9.8s, một cụm, **phủ cả beat 15** | **4.3s** (b14) + **6.0s** (b15, lộ ra) |
| 30 | 8.3s, một cụm cho hai mệnh đề | **4.8s** — sợi neo, rồi vòng mở ra và giữ |

Cả ba bản sửa là **thay đổi trạng thái trên vật đã có mặt**, gắn vào mệnh đề đang được đọc.
Không vật mới, không nhãn mới, không trang trí. Beat 6 của `ch1` vẫn **không** được thêm cụm —
đó là chuẩn, không phải chỗ sót.

## 3 · MỘT KHOẢNG GIỮ MỚI LỘ RA: beat 15

Khoảng 9.8s cũ được gán cho beat 14, nhưng nó **phủ hai beat**. Khi beat 14 có cụm thứ hai,
phần còn lại hiện ra là một khoảng 6.0s thuộc **beat 15** — chưa từng có trong bảng lượt 10.

Đo tiếp thì thấy cụm được khai cho beat 15 là `tl.to(['#spA','#spB'], { opacity: 1 }, 8.4)`, áp
opacity 1 lên hai vật **đã ở** opacity 1. Bảng 2×2 (comment × tween) cho cùng một băm mp4 ở cả
hai cột tween ⇒ **tween vô hiệu**. Một hành động được khai mà không xảy ra, cùng họ với cú
`String.replace` không khớp mà vẫn chạy.

Đã **xoá** tween đó và khai beat 15 là khoảng giữ **có chủ ý**, không thay bằng chuyển động khác:
nội dung beat 15 là "B kết thúc BÊN TRONG A" — một quan hệ, và LAW-2 chiều dương nói quan hệ là
một cấu hình. Hai khoảng đã nằm trên hình và B đã kết thúc bên trong A về hình học; lời chỉ nói
ra thứ hình đang cho thấy. Cùng loại với beat 20 và beat 32.

**Đây là mục reviewer có thể không đồng ý**, và nó được đặt ra như vậy: 6.0s là dài, và lý lẽ
biện minh nó là lý lẽ về vị từ, không phải về cảm thụ. Tôi không tự thêm cụm ở đây.

## 4 · TIMING vẫn khớp sau khi sửa

```
node -e "..."   # tổng duration 8 chương trong voice/shot_timing.json
```

```
tổng 8 chương  168.45s
lời thật       168.45s      lệch 0.000s
đệm đuôi       0.083s       (lượng tử hoá 30fps, đã khai trong shot_timing.json)
```

`cv compose` từ chối khi lệch > 0.05s; nó đã chạy qua.

## 5 · BỐN LOCK, quét lại trên bản có giọng sau khi thêm ba cụm

```
node tools/review-h01-voiced.mjs        # mục D
node tools/review-h01-mute.mjs          # mục 5, 6
```

| lock | đo | kết quả |
|---|---|---|
| LOCK-1 "replica chậm" | độ dày hai thanh tiền tố ở x=300/450/600 | **4/4 · 4/4 · 4/4** — cùng độ dày ở cả ba cột |
| LOCK-2 "mất dữ liệu" | pixel báo động chạm dấu commit, 7 mốc | **không có** |
| LOCK-3 "EC vỡ" | đầu mút dưới có đi tới nơi | **617 → 802**, dịch 185px — EC hoàn tất |
| LOCK-4 "một fix đúng" | phạm vi đường ở bốn vị trí | **170..909** — bốn vị trí cùng một tỉ lệ |

Ba cụm thêm vào không mở lock nào. Đó là lý do phải quét lại: thêm một cụm là thêm một cơ hội rò.

## 6 · FULL-VIDEO REVIEW, cả sáu mục, trên bản có giọng

```
node tools/review-h01-mute.mjs
```

`sáu mục ĐẠT`. Hai chỗ nối đầu và cuối vẫn báo *"không phân giải được (mực 0k)"* — `ch1` mở ra
từ nền trống và `ch5` đóng lại vào nền trống, nên phép so khung không có mực để so. Đó là giới
hạn của phép đo, đã khai từ lượt trước, không phải một khuyết điểm mới.

Mục 4 (khoảng đứng) vẫn là **đo, không xử**: ngưỡng 3.0s là ngưỡng cho **LẶNG**, và bản này có
lời ở mọi khoảng > 3.0s — bảng §2 mới là chỗ phán quyết.

Hai lỗi dụng cụ trong `review-h01-mute.mjs` đã sửa trước khi tin số của nó: nó từng chọn phim
bằng `readdir()[0]` (đúng nhờ thứ tự chữ cái) và lấy đuôi bằng `136 − chuyển_động_cuối` với 136
là độ dài bản **CÂM** — trên bản 168.5s phép đó ra số âm.

## 7 · BẰNG CHỨNG 5 SHOT KHÔNG SỬA GIỮ NGUYÊN TỪNG BYTE

Renderer đã được chứng minh xác định ở tầng byte: hai lần render cùng một source cho cùng một
băm. Nên băm trùng là bằng chứng đủ cho "không bị sửa".

| shot | index.html | render.mp4 |
|---|---|---|
| ch1-su-co | 0231f9f4… → c2a060f9… | 8b83f82f… → c90312bc… |
| **ch2-co-che** | **cf795612… giữ** | **6a72a568… giữ** |
| ch3-cua-so | 9d5c2571… → 99b9387b… | 7fe1e0d6… → 15dce71a… |
| **ch-aha** | **f91a55c6… giữ** | **a63c983d… giữ** |
| **ch4-bao-dam** | **14e024ea… giữ** | **7d8f9b5e… giữ** |
| ch-bon-vi-tri | d1f66359… → 0076274c… | 7d035c5e… → cce2372f… |
| **ch-do-luong** | **2140fe9d… giữ** | **b8edccb5… giữ** |
| **ch5-cau-hoi** | **732ad210… giữ** | **b9e080a0… giữ** |

## 8 · MỘT PHÁT HIỆN VỀ RENDERER, ràng buộc mọi chứng minh byte về sau

Đổi **riêng văn bản comment** trong HTML — JS thi hành sau khi bóc comment **byte-identical, 8150
bytes cả hai bản** — vẫn đổi **414/416 khung**. Đã định vị: `x 200..612, y 1241..1478`, 6342
pixel/khung lệch > 20, YAVG tối đa **0.18/255**. Là **antialiasing subpixel của hai dòng nhãn
chữ**; hai ảnh cắt cận cảnh trông y nhau, và không đại lượng nào trong bộ đo chạm tới nó.

Hệ quả đã áp dụng ngay: ghi chú giải thích beat 15 được đặt **ngoài** phần phát vào HTML, và
`ch3-cua-so/render.mp4` được chốt về đúng `15dce71a…` — **cùng bytes mà cả hai review đã đo**.
Nghĩa là kết quả sáu mục + A/B/C/D áp cho chính bytes của artifact cuối, không phải cho một bản
gần giống.
