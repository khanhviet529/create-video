# ĐỊNH LUẬT — LAW-2, MỞ RỘNG THỨ HAI: vị từ định luôn LƯỢNG CHUYỂN ĐỘNG mà thiết bị chở được một cách trung thực

LAW-2 (`LAW-device-teaches-only-its-predicate.md`) nói thiết bị chỉ dạy được **LOẠI** quan hệ mà
vị từ của nó phát biểu. Mở rộng thứ nhất (`LAW-device-predicate-positive.md`) dùng điều đó theo
chiều dương để **dựng**. Mở rộng này nói về một hệ quả khác của cùng vị từ: **trần chuyển động**.

> **Vị từ QUAN HỆ → một CẤU HÌNH → ít chuyển động trung thực.**
> **Vị từ QUÁ TRÌNH → một DIỄN BIẾN → nhiều chuyển động trung thực.**

Nguồn: H01 lượt 10–11, đặt cạnh G01.

---

## Hai artifact, hai vị từ, hai tỉ lệ giữ

| video | vị từ chở cả video | tỉ lệ giữ đo được | khoảng giữ dài nhất |
|---|---|---|---|
| G01 | **bloat lớn dần** — QUÁ TRÌNH | 45.4% | 4.75s |
| H01 | **bao hàm tiền tố** — QUAN HỆ | 74.3% | 7.00s |

29 điểm % chênh lệch **không phải khuyết điểm của H01**. Một quan hệ là một cấu hình: khi hai
tiền tố đã ở đúng vị trí, quan hệ *đã được phát biểu xong*. Thêm chuyển động sau đó không làm nó
đúng hơn — nó chỉ làm hình nói một điều mà vị từ không nói.

Bằng chứng ngược, cũng từ H01: mọi lần thử hạ tỉ lệ giữ bằng chuyển động nền (WAL chạy liên tục)
đều mở lại một lock đã đóng — hình thành "replica đang chạy đuổi", tức **"replica chậm"**, đúng
thứ LOCK-A cấm. Chuyển động thêm vào một vị từ quan hệ không trung tính: nó phát biểu một vị từ
khác.

## Hệ quả cho phép so sánh

Tỉ lệ giữ của hai video mang vị từ khác loại **không phải hai giá trị của cùng một đại lượng**,
nên hiệu của chúng không phán quyết được gì. Một ngưỡng so-với-benchmark chỉ hợp lệ khi hai bên
cùng loại vị từ. Xem `METHOD-measure-the-claim.md` §"ngưỡng tự khai" và §"mẫu số đúng".

## Chạy nó ở STEP 2, không phải ở vòng 10

Đây là **câu hỏi lọc số 5** của Step 2:

> **Vị từ của thiết bị chở được BAO NHIÊU chuyển động trung thực?**
> Nếu vị từ là QUAN HỆ → chờ một artifact phần lớn TĨNH, và khai điều đó TRƯỚC khi dựng.
> Nếu vị từ là QUÁ TRÌNH → chờ chuyển động liên tục.

Chạy câu này ở Step 2 của H01 sẽ dự đoán được "007 + bao hàm ⇒ tĩnh" **trước 10 vòng dựng**,
thay vì phát hiện nó như một con số ở vòng soát. Ghép với `GATE-beat-budget.md`: cổng ngân sách
beat cho biết **cần bao nhiêu cụm**, câu hỏi này cho biết **được phép có bao nhiêu cụm trung
thực**. Hai con số đó phải gặp nhau *trước* khi dựng; nếu chúng không gặp, vấn đề nằm ở chỗ chọn
thiết bị, không ở chỗ dựng.
