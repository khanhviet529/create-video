# F01 — Step 4 revision: Composition Architecture

Sửa tầng bị thiếu: `visual_operation` → **hệ quả không gian**.

Không đổi: semantic model · nghĩa narration · H2 · ngữ nghĩa fix · ngữ nghĩa detection ·
match cut 03→04 (đã đo YMAX = 0) · quyết định camera · danh sách shot, thời lượng, thứ tự,
logic chuyển cảnh.

---

## Tầng bị thiếu, phát biểu đúng

Kiến trúc cũ đặt tên cho tám `visual_operation` rồi coi như xong. Đo được: cả tám đều ra
**cùng một trang tài liệu góc trên trái** — trái > phải **15/15**, trên > dưới **15/15**, nửa
dưới trống hoàn toàn **9/15**.

Một operation phải khai **ba** thứ, không phải một:

| | |
|---|---|
| **(a)** | khối lượng nằm ở đâu |
| **(b)** | **neo dọc** — vùng nào của khung được phép giữ mass |
| **(c)** | **khoảng trống nghĩa là gì** |

**(c) là phát hiện của vòng này.** Ở bản hỏng, "nửa dưới trống" **không nghĩa gì cả** — nó là
phần thừa. Ở c4 khoảng trống *nghĩa là* câu hỏi chưa được trả lời. Ở c1 mép cắt *nghĩa là* bạn
đang xem một mảnh của thứ lớn hơn.

> **Nếu khoảng trống không mang nghĩa thì composition chưa được thiết kế** — và cái phản xạ
> neo-lên-đỉnh sẽ tự điền vào chỗ trống đó.

Bỏ (b) ra là lý do ba trong năm prototype vòng đầu vẫn nặng nửa trên **dù luật của chúng đã
đúng**. Luật nói mass ở đâu; không luật nào cấm tôi bắt đầu đặt từ y≈240 theo thói quen.

---

## Các họ operation và luật không gian

| họ | shot | luật không gian (a + b) | khoảng trống nghĩa là gì (c) |
|---|---|---|---|
| **code / tác giả** | s03 · s04 · s11 | **KHÔNG ĐỔI.** Flush-left là earned: code căn lề trái theo bản chất, và thân hàm phải trông hoàn chỉnh | chỗ để đọc, và bạn nhìn thấy **chỗ thân hàm kết thúc** — đó là điều làm "không có gì trông sai" đứng được |
| **inspection** | s01 · s05 | cái gì **ĐẾN** thì chiếm: mass ở dải giữa, tràn hết bề ngang, dòng dài **bị mép khung cắt**. Không có lễ nghi lề 93 | khung **không chứa nổi** thứ nó đang cho xem — bạn đang cầm một mảnh |
| **narrowing** | s02 · s08 · s09 · s13 | ứng viên rải trên một trường **rộng**, x lệch nhau; câu còn sống hạ **xuống thấp**, vào đúng chỗ chúng vừa nhường | vùng vừa bị bỏ trống — bạn **nhìn thấy cái đã bị loại** ở chỗ nó từng đứng |
| **counting** | s06 · s14 | universe rời nhau thì vùng rời nhau và **không dùng chung baseline ở CẢ HAI trục** | khe không-thẳng-hàng: **hai thứ này không cộng được với nhau** |
| **transformation** | s10 | phép toán **duy nhất mà mass không được dịch**: câu bị biến đổi giữ tâm quang học, một mình, một vế bị thay tại chỗ | trên là tiền đề, dưới là nguồn — câu ở giữa **là cả thế giới** |
| **accumulation** | s12 | nhóm đã biết giữ nguyên chỗ; nhóm mới vào **vùng nhóm cũ chưa từng chiếm** | vùng nhóm đầu **chưa bao giờ đòi** — nên nhóm hai không đọc thành "thêm dòng của cùng danh sách" |
| **naming** | s07 | cái tên **lấy cả trường trước**, không cho gì khác vào; phân loại đến **sau**, ở lề | trường mà một cái tên cần để được *nhận*, không phải để được *đọc* |
| **hold** | s15 | mực **ở thấp**, trường phía trên để mở | **chưa được trả lời** — không có gì đứng trước câu hỏi, nên nó không phải một kết luận |

Không luật nào ở đây là "đổi căn lề cho khác". Mỗi luật trả lời câu hỏi *phép toán này làm gì
với khung*, và câu trả lời suy từ nghĩa của phép toán trong **video này**.

---

## Shot giữ nguyên, và vì sao

**s03 · s04 · s11** — không sửa vì bất kỳ lý do đa dạng nào.

- **s03 / s04**: vật liệu là **code**, và code căn lề trái theo bản chất. Luật §5.2 của Step 2
  đòi thân B phải trông *hoàn chỉnh và đã qua review*; căn giữa hay đẩy xuống dưới một thân hàm
  sẽ phá đúng điều đó.
- **match cut 03→04** đã chứng minh bằng đo: **YMAX ảnh hiệu = 0** trên PNG render trực tiếp.
  Đụng vào composition của một trong hai là phá bằng chứng đó.
- **s11**: vật liệu cũng là code (danh sách đường + ví dụ), và nó vừa qua một vòng loại-và-dựng-lại
  để bỏ cột token. Nó thuộc họ code, không thuộc họ accumulation — accumulation (non-code) chỉ
  còn s12.

---

## Năm prototype, kết quả đo

Frame cuối, YAVG theo nửa khung. Nền = 14. Sàn của vùng trống = 25.00.

**Nền so sánh — 15 shot của bản hỏng:** trái > phải **15/15** · trên > dưới **15/15** · nửa dưới
trống hoàn toàn **9/15**.

| prototype | họ | trái | phải | trên | dưới | |
|---|---|---|---|---|---|---|
| c1-inspection | inspection | 28.89 | 27.81 | 27.80 | **28.90** | nặng dưới |
| c2-narrowing | narrowing | 26.73 | **27.30** | 25.92 | **28.11** | **nặng phải VÀ nặng dưới** |
| c3-transformation | transformation | 27.21 | 26.39 | 27.38 | 26.22 | dọc gần cân (chênh 1.16) |
| c4-hold | hold | 28.19 | 26.80 | **25.00** | **30.00** | nửa trên trống hoàn toàn |
| c5-counting-disjoint | counting | 27.80 | 26.59 | 27.95 | 26.44 | dọc gần cân (chênh 1.51) |

- **c2 là khung đầu tiên trong cả project có phải > trái.**
- **Không prototype nào còn nửa dưới trống.** Thấp nhất 26.22, so với 25.00 ở 9/15 shot cũ.
- Ba trong năm nặng nửa dưới; hai còn lại gần cân. Không cái nào lặp lại thế đứng cũ.

Metrics **chỉ là chẩn đoán**. Không tối ưu về 50/50 — c1 và c4 lệch trái rõ và đó là đúng.
Điều phải biến mất là *15/15 khung hành xử như cùng một trang tài liệu góc trên trái*, và nó đã
biến mất.

---

## Hướng không gian bị loại, kèm lý do

| hướng | vì sao loại |
|---|---|
| **luân phiên trái / giữa / phải theo cơ học** | Loại **trước khi dựng**. Nó là xáo trộn phong cách: nếu vị trí không suy từ nghĩa thì vị trí không mang nghĩa, và người xem học được rằng vị trí là ngẫu nhiên. |
| **c2 v1 — "co lại" chỉ là một sự kiện thời gian** | Dựng, đo, loại. Ứng viên biến mất nhưng câu còn sống đáp **đúng chỗ chúng vừa đứng (nửa trên)**, nên **trạng thái cuối lại là hai khối căn lề trái**. Đo: trên 28.26 / dưới 25.76. Co lại phải đổi **trạng thái cuối**, không chỉ đổi lúc chuyển. |
| **c3 v1 — "tâm quang học" đặt ở y≈900** | 900 nằm **trên** đường giữa khung (960). Đo: 29.29 / 25.41 — vẫn nặng trên. Tôi vi phạm chính luật mình vừa viết, và chỉ số liệu mới chỉ ra. |
| **c5 v1 — hai trường tách ngang nhưng cùng neo đỉnh** | Đo: 29.16 / 25.23. Không-thẳng-hàng phải áp cho **cả hai trục**, nếu không thói quen dọc sống sót nguyên vẹn. |
| **divider giữa hai universe của c5** | Một divider **vẽ ra một chu vi**, và video này không có chu vi nào. Tách bằng **không-thẳng-hàng**, không bằng đường kẻ. |
| **cards · dashboard · box+arrow · camera bù cho composition · chữ to thay cho nhãn** | Không dùng ở đâu. Không cái nào suy từ một phép toán; chúng là cách trang trí sự khác biệt. |

---

## Kiến trúc shot có phải sửa không

**Không.** Danh sách shot, thời lượng, thứ tự, chuyển cảnh, camera và ngữ nghĩa giữ nguyên —
167s, 15 shot, biên độ 6s–19s.

Bản sửa là **cộng thêm**: mỗi shot non-code nhận một khối `composition` khai họ của nó và ba
mệnh đề (a)(b)(c). Step 5 dựng lại **12 shot**, không đụng s03 / s04 / s11.

## Một phát hiện về quy trình

`#fLbl` của c2 thiếu `position: absolute` nên nó rơi về static flow và render ở **mép trên cùng
khung** thay vì y=700. **`cv gate` báo clean** — nó không phải overlap, không phải contrast,
không phải motion. Không checker nào bắt được "phần tử ở sai chỗ".

Đây là lần thứ hai trong project contact sheet bắt được thứ gate không bắt (lần trước:
`p7-detection`). Củng cố cho luật hero-frame-cuối đã thêm: **gate chứng minh được không có lỗi
đã biết; nó không chứng minh được composition đúng.**

---

**Step 4 revision hoàn thành trên prototype. Chưa dựng lại 12 shot.**
