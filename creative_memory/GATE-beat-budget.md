# CỔNG — NGÂN SÁCH BEAT: dựng theo thời lượng LỜI, không theo nhịp kiểm câm

Cổng, không phải mục trong doc. Áp trước khi dựng **bất kỳ chương nào**, ở mọi benchmark sau.

---

## Cổng

> Trước khi dựng một chương, khai:
> - **beat nào** chương này chở;
> - **tổng âm tiết** của dải beat đó;
> - **thời lượng lời** ở tốc độ đã khai;
> - **số cụm sự kiện dự kiến** và **mật độ giây/cụm**, đặt cạnh nhịp beat trung bình.
>
> **Dựng theo thời lượng đó.**

## Vì sao — bằng chứng từ H01

H01 dựng 8 chương với "timing theo nhu cầu dựng", ra **131.0s câm**. Lời thật đo được
**168.45s**. Chênh 37.45s **không phải drift**: hai loại artifact khác nhau.

Chỉ nối đuôi cho đủ → **4.9–18.9s lời chạy trên khung đứng** ở sáu chương.
Giãn tỉ lệ vị trí sự kiện → **cả tám chương vẫn có khoảng > 4s**.

Đo được nguyên nhân: mật độ thật **2.4–6.0 giây/cụm sự kiện**, trong khi lời có một beat mỗi
**~4.3s**. Và theo beat thì hai chương thiếu hẳn (`ch1` 4 cụm/7 beat, `ch4` 4 cụm/5 beat).

> **Một chương dựng theo nhịp kiểm câm là artifact KHÁC với một chương dựng để chở narration,
> và khác biệt đó KHÔNG sửa được bằng retiming.**

## Cái retiming SỬA được, và cái nó KHÔNG sửa được

Sau khi có offset beat thật, ánh xạ tuyến tính từng khúc (neo ở mọi mốc beat) đưa
**168.45s hình = 168.45s lời, lệch 0.00s**, và hình đến lệch lời tối đa **+2.62s**. Nên
retiming **sửa được PHÂN BỐ**.

Nó **không** sửa được **MẬT ĐỘ**: một beat dài 8.8s với đúng một sự kiện vẫn là một khoảng giữ
8.8s sau khi retiming. Mật độ phải được quyết ở lúc **dựng**, và đó là việc của cổng này.

## Cách kiểm được

Sau khi dựng một chương, đếm cụm sự kiện trên artifact (4fps, `tblend` difference, YMAX > 8,
gộp khung cách nhau ≤ 0.5s) và so với **số beat của chương**, không với nhịp trung bình toàn bài:

```
cụm / beat  ≥ 1        → bệnh phân bố, retiming chữa được
cụm / beat  < 1        → thiếu thật, retiming KHÔNG chữa được
beat nào dài > 2× nhịp trung bình → beat đó cần ≥ 2 cụm, kiểm riêng
```
