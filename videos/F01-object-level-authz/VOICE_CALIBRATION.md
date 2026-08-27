# namtre_v2 — hiệu chỉnh tốc độ

`profile_id 7ded6c3d` · seed 1 · language vi · 5 đoạn đại diện × 4 tốc độ = 20 lượt sinh,
mỗi lượt xác minh qua `/history` bằng `X-Audio-Id` trước khi tính vào bảng.

WAV ở `voice/calibration/` — đặt tên theo `s<speed>-seg<index>.wav` để nghe so sánh.

## Vì sao 1.15 không mang sang được

`speed = 1.15` được chọn cho **giọng mặc định của provider**, bằng cách chia nhịp âm tiết mà
package giả định cho nhịp đo được của giọng đó. Nó là một phép **bù**: giọng ấy chậm hơn
package tính, nên phải đẩy lên.

namtre_v2 không phải giọng ấy. Ở `speed = 1.00` nó đã nói **4.11 âm/s**, trong khi package
giả định **4.21 âm/s** (699 âm tiết / 166s). Lệch 0.10. **Không còn gì để bù** — đắp thêm
1.15 lên trên là nhân tiếp một hệ số mà nguyên nhân của nó đã biến mất.

## Đo được

Thời lượng có đo, nhưng không dùng làm tiêu chí. Hai đại lượng dưới đây liên quan tới nhịp
nói hơn:

- **tỉ lệ lặng** — bao nhiêu phần của clip là im. TTS khi tăng tốc nén khoảng nghỉ trước khi
  nén phát âm, nên tỉ lệ lặng tụt là dấu hiệu sớm nhất của một giọng không còn thở.
- **âm/s thuần** — âm tiết chia cho thời gian nói thật (đã trừ lặng). Nó tách "nói nhanh"
  khỏi "không dừng". Người kể chuyện tự nhiên giữ tốc độ phát âm khá ổn định và tiêu tốc độ
  vào khoảng nghỉ; âm/s thuần leo lên là giọng đang thật sự hối.

| speed | âm/s tổng | âm/s thuần | tỉ lệ lặng | số nghỉ | ước cả bài |
|---|---|---|---|---|---|
| **1.00** | **4.11** | **5.16** | **20.2%** | **25** | **170.1s** |
| 1.05 | 4.40 | 5.36 | 17.8% | 21 | 158.9s |
| 1.10 | 4.51 | 5.49 | 17.8% | 23 | 155.0s |
| 1.15 | 4.67 | 5.52 | 15.4% | 19 | 149.7s |

Phép ngoại suy đáng tin: ước 149.7s ở 1.15 so với 148.47s đo thật cả bài — lệch 0.8%.

### Tỉ lệ lặng theo loại câu

| loại câu | 1.00 | 1.05 | 1.10 | 1.15 |
|---|---|---|---|---|
| giải thích thường | 17.9% | 16.3% | 16.3% | 16.4% |
| thuật ngữ dày (IDOR/OWASP) | 18.9% | 14.1% | 16.8% | 14.5% |
| **câu ngắn dứt** | **22.5%** | **21.0%** | **19.5%** | **11.3%** |
| câu dài nhiều vế | 21.1% | 19.3% | 16.5% | 13.4% |
| câu hỏi kết | 21.5% | 19.9% | 23.1% | 22.0% |

Hai chỗ đáng chú ý:

**Câu ngắn dứt rơi vực ở 1.15** — 19.5% xuống 11.3%, mất gần một nửa khoảng nghỉ trong một
nấc. Và âm/s thuần của nó *giảm* ở nấc đó (5.7 → 5.4), nghĩa là toàn bộ phần tăng tốc đi vào
ăn khoảng nghỉ chứ không vào nói nhanh hơn. "Nên cách sửa không nằm ở việc đổi id" là một câu
tồn tại để **đáp xuống**; mất nửa khoảng im quanh nó thì nó không đáp nữa.

**Câu thuật ngữ dày có tỉ lệ lặng thấp nhất ở mọi tốc độ.** Âm/s thuần của nó thấp nhất
(4.67–5.08) — giọng tự chậm lại cho IDOR và OWASP, đó là điều tốt — nhưng nó cũng là câu ít
khoảng thở nhất. Thuật ngữ lạ cộng ít khoảng nghỉ là tổ hợp rủi ro nhất cho việc hiểu.

Câu hỏi kết giữ được khoảng riêng ở mọi tốc độ (21.5–23.1%): ngữ điệu hỏi tự đòi chỗ.

## Hệ quả timing

Chiếu bao lên đúng khung 17 shot / 195s đang có:

| speed | lời | lặng | shot vượt ngưỡng 3.0s |
|---|---|---|---|
| **1.00** | **168.7s** | **26.3s** | **không có** |
| 1.05 | 157.6s | 37.4s | 3 |
| 1.10 | 153.7s | 41.3s | 5 |
| 1.15 | 148.5s | 46.5s | 6 |

Kiến trúc hiện tại thiết kế 21.3s lặng. Ở 1.00, con số là 26.3s — dư 5s rải trên 17 shot,
khoảng +0.3s mỗi shot. Đó là chỉnh, không phải dựng lại.

## Khuyến nghị: 1.00

Ba lý do độc lập cùng chỉ về một chỗ:

1. **1.00 là nhịp package giả định.** 4.11 so với 4.21 âm/s. Hệ số 1.15 sinh ra để sửa một
   sai lệch mà giọng này không có.
2. **Mọi đại lượng về nhịp đều xấu đi đơn điệu theo tốc độ**, và chỗ xấu nhanh nhất là câu
   ngắn dứt — đúng loại câu mà cả việc của nó là đáp xuống.
3. **1.00 là tốc độ duy nhất không đẻ ra bài toán retiming.** Không shot nào vượt ngưỡng.

Nếu runtime là ràng buộc thì 1.05 là lựa chọn lùi: 158.9s, ba shot vượt ngưỡng, và câu ngắn
dứt vẫn giữ 21% khoảng nghỉ. Từ 1.10 trở lên thì đang mua 5–9 giây bằng khoảng thở của câu
dài nhiều vế, và tôi không thấy đổi chác đó đáng.

## Giới hạn

**Tôi không nghe được.** Tất cả những gì trên đây là đo và suy từ đo. "Tự nhiên" là phán
quyết của tai người, và 20 file WAV nằm sẵn ở `voice/calibration/` để nghe. Nếu tai nói khác
số, tai đúng.
