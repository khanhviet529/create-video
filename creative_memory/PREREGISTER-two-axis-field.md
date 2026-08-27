# PRE-REGISTER — trường hai trục `(đồng hồ × vị trí trên lịch sử)`

**Đăng ký trước khi dựng**, theo `docs/VISUAL_ENGINE_V2.1.md` §16. Ứng viên cho
`H01-two-meanings-of-after` (Package 007), **chưa được prototype, chưa được chứng minh**.

> Ghi ở dạng `.md` chứ không `.yaml` là có chủ ý: `cv recall` chỉ đọc `*.yaml`, nên file này
> không làm nhiễu bộ nhớ của các video đã đóng băng. Khi H01 đóng băng, nội dung ở đây phải
> được gấp vào `fingerprint` của nó — cùng với kết quả thật, kể cả nếu kết quả là **bị loại**.

---

## Vì sao nó chạy được *(giả thuyết, chưa phải kết luận)*

Chủ đề 007 có **hai thứ tự độc lập trên cùng một tập sự kiện**: thứ tự theo đồng hồ, và thứ tự
theo vị trí trên replication log. Cú aha của package là hai thứ tự đó **trùng nhau khi có một
node và tách ra khi có hai**.

Trường hai trục chở được đúng điều đó vì nó cho mỗi sự kiện **hai toạ độ** và để **phép chiếu**
quyết định thứ tự. Không cần thiết bị riêng cho cú aha: đảo thứ tự là **hệ quả hình học** của
việc một dấu rời khỏi đường primary, không phải một hiệu ứng được thêm vào.

Nó cũng chở được ba thứ khác mà không cần từ vựng mới: độ trễ thành **độ lệch song song** (không
phải độ dốc); cửa sổ thành **một vùng**; và *"không node nào hỏng"* thành **vùng bất khả** phía
trên đường primary — nơi không quan sát nào sống được, nên "đứng sau" là chỗ **duy nhất** mọi
thứ có thể đứng.

## Nó phục vụ chức năng ngữ nghĩa nào

**Duy nhất một:** làm cho **thứ tự trở thành thứ phụ thuộc vào hệ quy chiếu**, và làm điều đó
mà không cần một câu chữ nào tuyên bố như vậy.

Nó **không** phục vụ: thể hiện trạng thái theo thời gian · so sánh đại lượng · vẽ topology hệ
thống · trưng bày dữ liệu chuỗi thời gian. Nếu nó đang làm một trong bốn việc đó thì nó **không
còn là thiết bị này** — nó là một biểu đồ.

## Khi nào **KHÔNG** được dùng lại

Thiết bị này nằm **rất gần** thói quen *"video nào cũng có lưới"*. Bốn điều kiện loại, kiểm
được **trước** khi dựng:

1. **Chỉ có một thứ tự.** Nếu chủ đề không có hai cách sắp thứ tự **độc lập** trên cùng tập sự
   kiện thì trục thứ hai không mang thứ tự nào — nó thành một biểu đồ, và cú aha không tồn tại.
2. **Trục thứ hai là một ĐẠI LƯỢNG, không phải một THỨ TỰ.** Nếu trục dọc đo "bao nhiêu" thay
   vì "ở đâu trong một chuỗi", đây là **cái thước G01 mặc áo mới** — đúng cảnh báo *"aha nào
   cũng thành thước"*. Loại.
3. **Không có lịch sử dùng chung.** Thiết bị đòi **một** chuỗi mà nhiều bên cùng đi qua ở những
   vị trí khác nhau. Không có nó thì hai đường không chia chung gì, và trường thành hai biểu đồ
   xếp chồng.
4. **Trường phải được dạy mới đọc được.** Nếu chủ đề không sinh ra được một câu hỏi mà trục thứ
   nhất trả lời không nổi, thì trục thứ hai đang được **phát cho** chứ không được **kiếm về** —
   và người xem sẽ phải học cách đọc biểu đồ trước khi học được cơ chế. Loại.

**Và một điều kiện loại về ĐỘ PHỨC TẠP:** thiết bị bắt người xem giữ **hai thứ tự cùng lúc**.
Đó là một canh bạc. Nếu kiểm câm cho thấy người xem không giữ nổi, nước đi đúng là **lùi về biểu
diễn đơn giản hơn** (bao hàm tiền tố — xem `VISUAL_STRATEGY.md` §15), **không** phải cứu trường
vì nó thoả V2.1 đẹp hơn. Tiêu chuẩn review không thưởng cho độ phức tạp.

---

## Kề cận đã khai với thiết bị của G01

Giả thuyết *"một trường bất biến, bốn phép biến hình tích lại"* (bốn vị trí đánh đổi) nằm **kề**
thiết bị đã cứu CH10 của G01: *một khung đứng im trong khi ruột nó mang ba nghĩa*.

**Khác biệt phải giữ được:** ở G01, **sự bất động chính là khẳng định** (mốc nước không đi theo).
Ở H01, trường bất biến chỉ là **cái sân**; khẳng định nằm ở **khác biệt giữa bốn phép biến hình**.

Nếu tới Step 3 thấy trường đang được giữ im **vì nó trông giống G01** chứ không vì lý do trên —
đó là thói quen nhà, và phải loại.

---

## Trạng thái

`ỨNG VIÊN — CHƯA CHỨNG MINH`. Bác được bằng **R1** (kiểm câm phép chiếu).
Nếu bị loại, ghi vào `rejected_devices` kèm số đo, đúng cách cú vào gần CH1→CH2 của G01 bị loại.

---

## KẾT QUẢ R1 — **BỊ LOẠI Ở DẠNG ĐANG KHAI**

Đo trên artifact, `STEP3_R1_FINDINGS.md`. Cập nhật ba mục của đăng ký trước:

**Vì sao nó KHÔNG chạy được (thay cho giả thuyết "vì sao chạy được"):**
Giả thuyết trung tâm — *"độ lệch song song tự nó đã là phép chiếu đôi"* — **sai về mặt thị
giác**. Hai đường bậc thang chỉ khác nhau một cú tịnh tiến có **đoạn phẳng ở đúng cùng một y**,
nên chúng vẽ đè lên nhau: đo được **43% số cột đường primary bị phủ**. Thứ render ra là một hình
bình hành, không phải hai đường song song. Và hai mảnh còn nhìn thấy có độ dốc −4.45 vs −0.19,
tức hình **dạy "replica chậm hơn"** — semantic lock A, đi vào qua hình học.

**Luật tổng quát rút ra — mang đi mọi benchmark sau:**

> **Một phép tịnh tiến là vô hình ở mọi chỗ mà thứ được tịnh tiến đang phẳng.**
> Vẽ "độ trễ" thành "độ lệch" chỉ đọc được ở nơi đại lượng đang thay đổi. Với một hệ phần lớn
> thời gian đứng yên giữa hai sự kiện, đó là gần như không ở đâu.

**Cái gì vẫn đúng và mang sang được:** dấu bất động qua đổi hệ quy chiếu **là dựng được** (khớp
mẫu: lệch 0px ở 6 mốc); một trường với trục bất biến **không** đọc ra thành hai biểu đồ; và
`tools/check-parallel-lines.mjs` có negative control đã nổ thật.

**Khi nào KHÔNG được dùng lại — thêm điều kiện thứ năm:**

5. **Đại lượng phần lớn thời gian đứng yên.** Nếu hai đường chỉ khác nhau bởi một phép tịnh tiến
   và đường đó có đoạn phẳng dài, chúng sẽ trùng nhau trên màn hình. Kiểm TRƯỚC khi dựng: tỉ lệ
   chiều dài đoạn dốc trên tổng chiều dài đường. Thấp thì loại.

**Trạng thái:** `BỊ LOẠI — R1`. Đang sang **Lùi 1 (bao hàm tiền tố)**, thứ không dùng độ dịch để
mang nghĩa nên miễn nhiễm với đúng lỗi này.
