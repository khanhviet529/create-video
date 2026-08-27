# H01 — chiều sâu có nâng được trần tỉ lệ không? PRE-DECLARATION

Viết **trước khi dựng bất cứ thứ gì**, theo cổng §2. Câu hỏi hẹp, và **không** mở lại cú aha —
cú đảo đóng, beat 17–18 chở nó.

> **Câu hỏi:** thế giới bao hàm có trần tỉ lệ = 1 (một cú vào, một cú ra, bên trong không nấc
> nào), vì phạm vi bị **ghim** bởi bốn vị trí 497–500. **Chiều sâu có nâng được trần đó không?**

---

## PHÁN QUYẾT: **KHÔNG DỰNG**

Pre-declaration kết luận được, và kết luận là **gần chắc chắn không đạt, vì lý do cấu trúc**.
Không phải "không biết trước". Theo §2, báo lý do và dừng.

---

## Câu 1 — chiều sâu định mang TRỤC NGHĨA nào?

Soát cả sáu vai V2.1 §5 cho phép, đối chiếu với `semantic_model` của package:

| trục nghĩa §5 cho phép | có trong 007 không |
|---|---|
| phân cấp | **không** — user · app · primary · replica · wal không xếp hạng nhau |
| lịch sử | **trùng** — lịch sử **đã là** trục ngang (vị trí log). Chiều sâu sẽ nói lại điều trục ngang đang nói |
| trạng thái xếp lớp | **không** — không có lớp trạng thái nào chồng lên nhau |
| lớp ẩn bên trong | **không** — không có gì bị giấu; cả hai node đều trả lời đúng ở vị trí của nó |
| **khoảng cách giữa các mức trừu tượng** | **CÓ** — `user` / `app` là một mức, `primary` / `replica` / `wal` là mức khác |
| **nhiều biểu diễn đồng thời** | **CÓ trên giấy** — xem câu 2, mục (b) |

**Trả lời:** trục nghĩa hợp lệ duy nhất là **khoảng cách giữa hai mức trừu tượng** (lớp người
dùng vs lớp lưu trữ). Có thật, có trong danh sách thực thể. Không phải "trông sâu hơn".

---

## Câu 2 — nó có tạo được nấc tỉ lệ BÊN TRONG không? **KHÔNG.** Ba lý do độc lập.

### (a) Chiều sâu trực giao với PHẠM VI, mà trần được đặt bởi phạm vi

Trần tỉ lệ ở đây bị ghim bởi **phạm vi của trục vị trí**: bốn vị trí package gọi tên. Thu ra thì
mất vạch; giãn vào thì phải thêm vị trí package không nói tới.

Chiều sâu thêm một trục **trực giao với phạm vi đó**. Nó chứa được **nhiều vật hơn** hoặc
**nhiều lớp hơn**, nhưng nó **không làm trục vị trí hiện ra nhiều hay ít vị trí hơn**.

> Một **nấc tỉ lệ** đòi người xem suy nghĩ về **một lượng khác của CÙNG một thứ**.
> Chiều sâu cho **một lượng khác của NHỮNG THỨ KHÁC**.

Đó là hai chuyện khác nhau, và chỉ chuyện thứ nhất là nấc.

Lối thoát duy nhất về mặt hình học — **cuộn** lịch sử thành nhiều lớp sâu, mỗi lớp một dải vị
trí sớm hơn — đòi vẽ những vị trí **package không hề nói tới**. Đó là bịa nội dung, cùng loại
với việc vẽ một đường biên timeout cho `remote_apply`. Và nó tạo ra một vùng hình học lớn
**không beat nào gắn vào** — đúng chỗ G01 trượt bên ngoài khung.

### (b) Vai mạnh nhất của chiều sâu đòi ≥ 2 biểu diễn trung thực. Ta chỉ có 1.

V2.1 §5 nêu *"nhiều biểu diễn đồng thời"* — vai mạnh nhất, và đúng là vai hấp dẫn nhất ở đây.

Nhưng nó đòi **ít nhất hai biểu diễn trung thực để xếp chồng**, và Step 3 đã **đo** rằng chỉ có
**một** tồn tại:

- trường hai trục — chết vì LAW-1 (43% đường primary bị phủ; độ dốc biểu kiến −4.45 vs −0.19);
- bao hàm tiền tố — sống, và là biểu diễn duy nhất;
- cú duyệt — không phải một biểu diễn, chỉ là một trình tự (YAVG 0.0038 giữa hai lượt).

**Không thể xếp chồng nhiều biểu diễn khi chỉ có một.** Vai này không phải bị bác — nó **không
khả dụng**, và điều đó đến từ một kết quả đã có trong tay chứ không từ một phỏng đoán mới.

### (c) Nguy cơ MỚI — **chỉ với phép chiếu PHỐI CẢNH**: bơm vào một khác biệt ĐỊNH LƯỢNG giữa hai thứ buộc phải giống nhau

Bản steelman hấp dẫn nhất: đặt **node** lên trục sâu — primary ở gần, replica ở xa — để giải
phóng trục dọc.

Nó hỏng, và hỏng theo một cách đáng ghi:

> **Điều kiện:** lý do này chỉ đúng với **phép chiếu phối cảnh**. Phép chiếu **TRỰC GIAO**
> không co ngắn theo độ sâu, nên nó KHÔNG dính lỗi này. Phán quyết vẫn đứng vì **(a) và (b)
> độc lập với (c)**, và trực giao **không sửa được (a)** — nó vẫn trực giao với phạm vi.
> Ghi (c) ở dạng tuyệt đối sẽ là đúng lỗi mà tài liệu SCOPE vừa cẩn thận tránh.

- **Phối cảnh làm đường lịch sử của node xa NGẮN HƠN trên màn hình.** Nhưng cả hai node đọc
  **cùng một log, cùng những vị trí đó**. Hình sẽ nói replica có một lịch sử nhỏ hơn — một lời
  nói dối mà cơ chế không chứa.
- Đây đúng **cùng họ với R8** (độ dốc thay vì độ lệch): thiết bị tự sinh ra một khác biệt định
  lượng mà cơ chế không có, và `never_say` không với tới vì nó đi qua hình học.
- Cộng LAW-2: vị từ của chiều sâu là **gần/xa** — tức khoảng cách hoặc phân cấp. Thứ cần chở ở
  đây là **đồng thời**. Sai loại vị từ, y như đoạn bao sai loại cho thứ tự.

Và giải phóng trục dọc **không giúp gì**, vì trần nằm ở **phạm vi ngang**, không ở trục dọc.

---

## Câu 3 — mở được nhiều observer trên cùng lịch sử mà không thêm vị trí không?

**CÓ, có điều kiện — nhưng nó không mua được gì.**

Chiều sâu chứa được nhiều observer ở cùng bốn vị trí, không cần vị trí mới. Nhưng:

1. **Nhiều replica không có trong narration.** `edge_cases[3]` có nói (*"mỗi cái ở một vị trí
   riêng; route ngẫu nhiên làm người dùng nhảy tới lui giữa các phiên bản thế giới"*) nhưng
   narration **không nhắc**. Dựng nó là dựng nội dung không có trong lời.
2. **Nhiều câu đọc của cùng một người dùng thì 2D đã làm được rồi, và đã đo.** CH-A dùng sợi
   phục vụ: `trên 0px · dưới 364px`, NC nổ đúng khi nối sai. Chiều sâu không thêm gì.

Nên câu 3 đạt về mặt kỹ thuật và **rỗng về mặt giá trị**.

---

## Vì sao KHÔNG dựng — và vì sao đây không phải lười

Prototype thứ ba (cú duyệt) đã khai trước rằng nó là tiếng vọng, là đổi tiêu điểm, và lượt
theo-thứ-tự-tới không neo được vào gì — rồi vẫn dựng, để lấy số. Giá trị biên của lần dựng đó
gần bằng không: nó xác nhận một dự đoán thay vì trả lời một câu chưa biết.

Ở đây khác: câu 2 **không phải một dự đoán về cảm thụ** (thứ chỉ artifact mới phân xử được).
Nó là một mệnh đề về **cấu trúc của không gian biểu diễn**:

> trần tỉ lệ bị đặt bởi **phạm vi**; chiều sâu **trực giao với phạm vi**.

Mệnh đề đó không cần render để kiểm — render nó chỉ cho ra một khung hình đẹp hơn cùng bốn vị
trí đó. Và lý do (b) thì đã **được đo rồi**, ở Step 3.

Nếu câu 2 là *"chiều sâu có ĐỌC ra không"* thì phải dựng. Nhưng câu 2 là *"chiều sâu có tạo
được nấc không"*, và câu đó trả lời được bằng hình học.

---

## Theo §5 — quy tắc dừng

Prototype này **không rõ ràng đạt câu 2**, và nó không được dựng vì lý do cấu trúc đã nêu.

> **Nhánh chiều sâu ĐÓNG VĨNH VIỄN.** Dựng nốt H01 ở dạng hiện tại.
>
> **H01 là benchmark ĐO ĐƯỢC GIỚI HẠN** của biến đổi mức 3 và của thang tỉ lệ, trên một chủ đề
> **rời rạc · một hệ quy chiếu · phạm vi bị ghim bởi dữ liệu nó phải hiện**.

Ba giới hạn đó giờ có tên, có số đo, và có lý do cấu trúc — không benchmark nào trước đó vẽ được
chúng.

---

## Cập nhật một ghi chép trước đó

`creative_memory/SCOPE-h01-inversion-not-proven-impossible.md` viết rằng **nhánh chiều sâu chưa
ai đi**. Câu đó vẫn đúng cho **cú đảo** — chiều sâu chưa bao giờ được thử như một cách mang hệ
quy chiếu thứ hai, và tài liệu này **không** thử điều đó.

Tài liệu này chỉ đóng một câu hỏi khác: **chiều sâu và TRẦN TỈ LỆ**. Hai câu hỏi khác nhau,
đóng khác nhau, và không được trộn khi đọc lại.
