# F01 → Content Engine

Viết ở phía Visual Engine sau khi F01 đóng băng. **Không sửa gì trong
`technical-content-engine`.** Đây là vật để Content Agent đọc và tự quyết, không phải yêu cầu
đổi contract.

Chỉ giữ những gì có thể khái quát. Mọi bài học riêng của F01 nằm ở
`shot_plan.yaml → fingerprint.rejected_devices`.

---

## 1. Package 004 không cần sửa — cách đọc của Visual Engine mới sai

Step 2 của F01 phát biểu sai hai lần, theo hướng *"object authorization phải đặt một lần cho
mỗi đường"* và *"câu trả lời phân quyền có phạm vi một lần truy cập"*. Đã soát wording ở sáu
chỗ độc lập trong package: **package đúng cả sáu**. Invariant tổng quát đúng là

> mọi truy cập tới object được bảo vệ đều phải chịu quyết định phân quyền cần thiết cho
> (subject, resource, action) — và **chỗ đặt enforcement là lựa chọn kiến trúc**

không phải "mỗi route/handler phải tự gọi bản kiểm của riêng nó".

**Khái quát được:** khi Visual Engine báo mơ hồ, đo trước khi sửa. Lần này chi phí của việc
sửa nhầm sẽ là một package đúng bị làm cho kém chính xác đi.

## 2. `estimated_duration_sec` là một giả định về nhịp nói, và nó nên nói ra điều đó

Package 004 khai `699 âm tiết / 166s`, tức **4.21 âm tiết/giây**. Con số 166s tự nó vô dụng
với Visual Engine, vì thời lượng thật phụ thuộc giọng: cùng narration này đo được **148.5s**
với một giọng, **169.1s** với giọng khác, **173.7s** với giọng thứ ba. Chênh nhau 25 giây.

Cái mang sang được là **tỉ lệ**, không phải thời lượng. Và 4.21 âm/s hoá ra là một mốc tốt:
giọng cuối cùng chọn cho F01 nói 4.11 âm/s ở tốc độ tự nhiên, lệch 0.10 — nên hiệu chỉnh tốc
độ đúng là *không nhân hệ số nào cả*.

**Đề xuất:** nếu `estimated_duration_sec` có kèm `assumed_syllables_per_sec` thì phía tiêu thụ
có mốc để hiệu chỉnh thay vì một con số giây không so được với gì. Đây là thêm thông tin đã có
sẵn, không phải đổi contract.

## 3. Đếm âm tiết của package là chính xác và dùng được làm bất biến kiểm tra

Đếm token phân tách bằng khoảng trắng trên narration cho **đúng 699**, khớp
`syllable_count` tuyệt đối. Nghĩa là con số đó không phải ước lượng — nó là một bất biến
kiểm được, và Visual Engine đã dùng nó để xác nhận phép đo nhịp của mình trước khi tin.

**Khái quát được:** những trường tự kiểm được như thế này đáng giá hơn nhiều so với vẻ ngoài,
vì phía tiêu thụ có thể phát hiện package hỏng mà không cần hỏi.

## 4. Một đoạn narration nêu con số thì hình sẽ phải hiện con số đó

Đoạn 31 kết bằng *"rồi đếm xem bao nhiêu phần trăm route đã có test đó"*. Visual Engine đã bỏ
con số đi vì sợ phần trăm bị đọc thành điểm an toàn — rồi phải trả lại, vì **đoạn 32 tồn tại
đúng để nói con số ấy chứng minh và không chứng minh cái gì**. Package đã tự phòng; bỏ con số
là quyết thay Content Engine ở chỗ Content Engine đã lo.

**Khái quát được:** khi một đoạn *chỉ định* một artifact (một con số, một tên, một danh sách),
đoạn kế tiếp thu hẹp nó chính là cơ chế an toàn. Visual Engine phải tin cặp đó, không được
tháo vế đầu.

## 5. Chỗ mơ hồ có thật: narration chuyển giữa "sở hữu" và "thành viên"

`s10` nói *"phân quyền phải được thực thi theo quyền sở hữu bản ghi"* (chữ của OWASP), trong
khi cả câu chuyện chạy trên **membership** (`assertMember`, "còn là thành viên workspace
không"). `s13` lại nói cách sửa *"chỉ phủ quan hệ sở hữu"*.

Visual Engine đã bám đúng chữ của package và **không** tự hoà giải — hoà giải là bịa. Nhưng
người xem sẽ gặp hai từ cho một quan hệ.

**Không đề xuất sửa.** Chỉ nêu ra: nếu đây là chủ ý (trích OWASP nguyên văn rồi ví dụ hoá bằng
membership) thì tốt; nếu là trôi từ vựng thì nó là loại mơ hồ mà chỉ Content Engine giải được.

## 6. Đoạn văn là đơn vị bàn giao thật, và nên được coi như vậy

Narration được sinh tiếng **theo từng đoạn tác giả viết ra**, vì hai lý do tình cờ trùng nhau:
tunnel bỏ mọi response chậm hơn ~100s, và nhịp từng beat mới là thứ kiến trúc hình cần. Phép
tách chỉ được chấp nhận khi ghép lại tái tạo đúng từng ký tự văn bản gốc.

Hệ quả: **ranh giới đoạn trong package là ranh giới beat trong video.** 35 đoạn thành 35 beat,
và kiến trúc 17 shot dựng quanh chúng. Một đoạn bị gộp hay tách ở phía Content sẽ dịch nhịp
hình.

**Khái quát được:** ngắt đoạn không phải định dạng, nó là dữ liệu thời gian. Đáng để Content
Engine biết là nó đang quyết định điều đó.
