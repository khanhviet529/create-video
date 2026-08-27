# ỨNG VIÊN (chưa phải định luật) — thông tin chỉ chở bởi TRÌNH TỰ XUẤT HIỆN

**Trạng thái: ỨNG VIÊN.** Một instance. **Điều kiện kích hoạt thành định luật: gặp lần thứ hai
ở một benchmark KHÁC.** Không đặt tên LAW-3.

Chuẩn bằng chứng này lấy từ phía Content, vốn vừa từ chối thêm luật từ một ca. Áp cùng chuẩn cho
phía Video — nếu không thì hai engine chạy hai tiêu chuẩn khác nhau.

---

## Phát biểu ứng viên

> Thông tin chỉ được chở bởi **trình tự xuất hiện** không tồn tại trong bất kỳ **khung đơn** nào,
> nên **không kiểm được ở mức artifact** — và đặc biệt **không dùng được làm HỆ QUY CHIẾU cho một
> khẳng định về thứ tự**, vì lúc đó người xem phải giữ *thứ tự trình bày* làm dữ liệu trong khi
> chính phần trình bày đang tự nhận là nói về *thứ tự*.

## Instance duy nhất — H01, cú duyệt hai lượt

Hai lượt duyệt (theo thứ tự tới, rồi theo thứ tự vị trí) chỉ sinh ra **hai bức ảnh**, mỗi bức
xuất hiện đúng hai lần:

```
14.2s (lượt TỚI, nổ 499) vs 18.2s (lượt VỊ TRÍ, nổ 499)   YAVG 0.0038
12.2s (lượt TỚI, nổ 500) vs 20.2s (lượt VỊ TRÍ, nổ 500)   YAVG 0.0039
```

Toàn bộ thông tin của *"hai thứ tự"* nằm ở **trình tự xuất hiện của hai bức ảnh đó**, và ở không
gì khác. Không token nào trong khung phân biệt lượt nào là lượt nào.

## Vì sao CHƯA đủ để thành luật

Một ca. Và ca này có một đặc thù có thể là nguyên nhân thật: **thế giới bao hàm cố ý không có
trục thời gian**, nên lượt "theo thứ tự tới" không có gì để neo vào. Một thế giới **có** trục
thời gian có thể neo được lượt đó, và khi ấy phát biểu trên sẽ không áp dụng.

Phân biệt hai khả năng cần một ca thứ hai, ở một chủ đề khác.

## Khi nào kiểm lại

Gặp lần thứ hai: một thiết bị mà nghĩa của nó chỉ nằm ở **thứ tự trình bày**, không nằm ở khung
nào. Lúc đó so hai ca, và nếu nguyên nhân chung là "không có vật nào trong khung mang hệ quy
chiếu" thì nâng thành định luật với ba mục như LAW-1 và LAW-2.
