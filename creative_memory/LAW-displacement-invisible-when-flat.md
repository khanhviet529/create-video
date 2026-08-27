# ĐỊNH LUẬT — L1: một phép tịnh tiến là vô hình ở mọi chỗ mà thứ được tịnh tiến đang phẳng

Ghi ở **mức định luật ngữ pháp hình**, không phải mức ghi chú của một prototype. Áp cho mọi
benchmark sau, mọi chủ đề. Bằng chứng: `H01/STEP3_R1_FINDINGS.md`, đo trên artifact.

---

## Vì sao nó trượt

Hai đường chỉ khác nhau một cú **dịch** thì các **đoạn phẳng của chúng nằm ở đúng cùng một
toạ độ**, nên trên màn hình chúng **trùng nhau**. Chỉ những đoạn mà đại lượng đang **đổi** là
còn tách được.

Đo được ở H01 R1: **43% số cột của đường primary bị đường replica phủ** (417/736 cột còn nhìn
thấy). Thứ render ra là **một hình bình hành khép kín**, không phải hai đường song song.

## Nó phá chức năng ngữ nghĩa nào

Hai chức năng, và chức năng thứ hai mới là chỗ nguy hiểm:

1. **Nó xoá chính độ lệch mà nó định chở.** Nếu "trễ" được vẽ thành "lệch", thì ở mọi đoạn
   phẳng độ lệch trên màn hình **bằng không**. Nghĩa chỉ tồn tại ở một dải hẹp.

2. **Nó tạo ra một ĐỘ DỐC BIỂU KIẾN mà không ai chọn.** Các mảnh còn nhìn thấy được của hai
   đường có độ dốc đo được **−4.45** và **−0.19**. Người xem chỉ thấy hai mảnh đó sẽ đọc ra
   *"cái này phẳng hơn / chậm hơn"*. Ở H01 đó đúng là `semantic lock A` (*"replica chậm"*), đi
   vào **qua hình học**, không qua một chữ nào.

   **`never_say` không với tới được chỗ này.** Một lock ngữ nghĩa có thể bị phá bởi hình học
   trong khi mọi bộ lint đọc văn bản đều báo sạch. Đó là lý do những lock loại này phải có một
   **phép đo trên artifact**, không phải một dòng cấm trong tài liệu.

## Khi nào TUYỆT ĐỐI không dùng lại

Kiểm **trước khi dựng**, không phải sau khi render:

1. **Tỉ lệ đoạn-đổi trên tổng chiều dài đường thấp.** Nếu đại lượng phần lớn thời gian đứng
   yên, độ lệch sẽ vô hình gần như ở mọi nơi. Đây là điều kiện loại, không phải điều kiện cảnh
   báo.
2. **Hai vật buộc phải sống trên CÙNG một trục mang đại lượng.** Không có trục tự do để tách
   chúng ra, nên mọi cách tách đều là nói dối. *(Đối chiếu: Lùi 1 của H01 có một trục dọc chỉ
   nói "node nào" và không mang đại lượng nào — nên tách được mà vẫn trung thực. Đó là điều
   kiện đủ để dùng lại một cách an toàn.)*
3. **Chủ đề có một lock cấm cách đọc "nhanh/chậm".** Độ dốc biểu kiến sẽ dựng lại đúng cách
   đọc bị cấm.

## Kèm theo — phép kiểm dùng lại được

`tools/check-parallel-lines.mjs`. Hai phép: **độ dốc trên đoạn dốc** (yếu) và **residual sau
tịnh tiến** (mạnh, khớp đúng khẳng định *"cùng một đường, dịch đi"*). Có **negative control**
đã nổ thật. Dùng lại được cho mọi biểu diễn có hai vật lẽ ra phải song song.
