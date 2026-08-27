# F01 — Step 1: Semantic Analysis

Package `004-authz-per-object-not-per-request` · IDOR / Broken Object Level Authorization
Provenance: `PROVENANCE.yaml` · snapshot sha256 `36db1604…` · `cv provenance F01-object-level-authz` → CURRENT

Chưa có một quyết định thị giác nào trong tài liệu này. Đó là việc của Step 2.

> Ghi chú quy trình: Step 1 của E01 chưa từng được ghi ra đĩa — nó chỉ tồn tại trong
> transcript. Cùng loại thất bại với việc E01 không có provenance. Lần này ghi ra file.

---

## 1. Cơ chế, phát biểu chính xác

Có **hai đường đi tới dữ liệu của cùng một object**. Đường cũ (`doc_endpoint`) kiểm
membership rồi từ chối đúng. Đường mới (`comments_endpoint`) được thêm sau cho một tính năng
khác, nạp comment theo `document_id`, và **không hỏi bất kỳ quyết định phân quyền nào trên
tài liệu**.

Middleware xác thực chạy trên **cả hai** đường và làm đúng việc của nó: xác định principal.

Điểm chịu lực: bước kiểm **không bị bỏ qua** — nó **chưa từng tồn tại** trên đường mới.

## 2. Nhân quả — cái gì là nguyên nhân, cái gì chỉ là bằng chứng

Package đã gán `role` cho từng event, và ranh giới đó phải sống sót vào hình:

| event | role | nội dung |
|---|---|---|
| e1 | `precondition` | membership bị xoá 3 tháng trước |
| e2 | `precondition` | đường thứ hai được thêm **sau** |
| e3 | `trigger` | request kèm id tài liệu (id có hợp pháp từ hồi còn là thành viên) |
| e4 | `consequence` | middleware xác định principal — **đúng** |
| e5 | `supporting_evidence` | gọi đường cũ vẫn nhận 403 |
| **e6** | **`primary_cause`** | **nạp comment theo document_id, không có quyết định phân quyền nào** |
| e7 | `invariant_violation` | trả 200 kèm dữ liệu |

**e5 là cái bẫy nhân quả của topic này.** 403 ở đường cũ loại được ba giả thuyết cùng lúc —
xác thực hỏng, membership sai, quyền chưa thu hồi — nên nó rất dễ bị nâng thành nguyên nhân.
Nó không phải. Nó chỉ thu hẹp chẩn đoán về *đường đi*. Cùng loại lỗi với "dòng thoả nằm rải
rác nên phải seq scan" ở E01: một sự thật quan sát được, đúng, và không phải nguyên nhân.

## 3. Invariant nào vỡ, vỡ ở đâu

1. `one_decision_on_every_path` — mọi đường tới dữ liệu của một object đều phải qua **cùng
   một** quyết định phân quyền trên object đó. Vỡ ở **e6**.
2. `revoked_means_no_read` — principal không còn quyền thì không đọc được **bất kỳ phần nào**
   của object. Vỡ ở **e7**.

Đại lượng đếm được: `authorization_decisions_on_document`. Đường cũ → 1. Đường mới → **0**.
Kỳ vọng 1 ở mọi đường. `document_data_disclosed`: kỳ vọng `false`, thực tế `true`.

## 4. Người xem đang tin gì sai

> "Phân quyền là một bước trong request. Qua được bước đó là xong."

Và giả thuyết đầu tiên họ sẽ nêu: *"chắc phiên đăng nhập cũ chưa hết hạn"* — token. Package
loại nó bằng một dữ kiện, không bằng lời.

Điều đúng: **hai câu hỏi không cùng nhịp.** "Anh là ai" hỏi **một lần cho mỗi request**. "Anh
được chạm vào object này không" phải hỏi **lại ở mỗi đường đi tới object đó**. Số đường tăng
theo thời gian; số lần nhớ hỏi lại thì không.

## 5. Ba cách giải thích BỊ CẤM, và mỗi cái dẫn tới fix sai nào

1. **"IDOR là do id đoán được."** Đảo nhân quả. Ở kịch bản này id là UUID và được lấy **hợp
   pháp** từ hồi còn là thành viên — không cần đoán. Dựng theo nghĩa đen thì fix thành "đổi
   sang UUID", và fix đó không sửa gì.
2. **"Thiếu authentication."** Sai tầng. Authentication **chạy và thành công**. Gộp
   authentication với authorization chính là hiểu lầm video đang sửa.
3. **"Lập trình viên quên kiểm quyền."** Đúng về sự việc, **sai về nguyên nhân**, và là loại
   sai nguy hiểm nhất vì nghe rất hợp lý. Nó biến một thuộc tính **cấu trúc** — nghĩa vụ thủ
   công lặp lại ở mỗi đường — thành một **lỗi cá nhân**, rồi dẫn thẳng tới fix sai: nhắc nhau
   cẩn thận hơn, thay vì đổi chỗ đặt enforcement.

Cảnh báo cho Step 2/3: (3) là cái dễ lọt vào hình nhất. Bất kỳ hình nào cho thấy một bước
kiểm **bị bỏ qua**, **bị nhảy cóc**, hay ai đó **quên** — là đang dạy (3). Hình đúng phải cho
thấy bước kiểm **chưa từng có ở đó**. Đó là hai hình khác nhau, không phải hai cách nói.

## 6. Fix — và nó KHÔNG đổi cái gì

Thực thi quyền sở hữu bản ghi **ngay ở tầng nạp dữ liệu**, mặc định từ chối. Một cách làm:
không tồn tại đường nội bộ nào nạp được tài liệu mà không nói principal đang hỏi là ai —
repository nhận **principal**, không nhận mỗi **id**.

Không đổi: authentication · URL · id (không phải chuyển sang dạng khó đoán hơn) · handler cũ.

Và **không phải** thêm một dòng check vào từng handler — *chính nghĩa vụ nhớ-thêm-một-dòng là
thứ đang hỏng*. Fix là fix **cấu trúc**, không phải fix một dòng.

Fix mở ra: nghĩa vụ chuyển từ "nhớ kiểm ở mỗi đường" sang "không thể nạp object mà bỏ qua
kiểm". Endpoint thêm sau **thừa hưởng**, nên độ phủ thôi phụ thuộc trí nhớ và thôi suy giảm
theo thời gian.

## 7. Cái giá, và detection KHÔNG chứng minh gì

**Giá:** job nền, admin tool, migration, báo cáo thường không chạy dưới danh nghĩa người dùng
nào → phải mở một **lối đặc quyền**, và lối đó thành bề mặt rủi ro mới. Bù lại nó nằm một
chỗ nên canh được. Chỉ phủ quan hệ **sở hữu/thành viên**: chia sẻ có điều kiện, quyền uỷ
quyền, vai trò lồng nhau vẫn cần một tầng policy thật. Không phủ đường không đi qua tầng đó —
raw SQL, ORM gọi thẳng, service khác đọc chung database.

**Detection:** với mỗi route nhận object id từ client, một test gọi lại route đó bằng
principal thứ hai không có quyền và khẳng định không nhận 200. Chỉ số là **ĐỘ PHỦ** (bao nhiêu
% route đã có test đó), và **xu hướng** của nó quan trọng hơn số lỗi pentest tìm ra — pentest
lấy mẫu, độ phủ thì đếm.

**Không chứng minh:** test xanh chỉ chứng minh principal **trong fixture đó** bị chặn. Không
phủ cựu thành viên, quyền vừa thu hồi, vai trò lồng nhau. Không chạm tới đường không đi qua
route HTTP — GraphQL resolver, consumer hàng đợi, webhook, job nền. Và **độ phủ 100% cũng chỉ
chứng minh CÓ một quyết định ở mỗi đường, không chứng minh quyết định đó đúng.**

Đây là ranh giới bắt buộc phải vào hình. Một bài test không kèm ranh giới nó-không-chứng-minh-gì
tạo ra cảm giác an toàn sai — chính là `hook_type: false_safety` của package.

## 8. Replay engine có biểu đạt được model này không

Có, và không cần sửa validator. Kiểm trước khi dựng, đúng bài học E01.

- `revoked_means_no_read` → invariant kind **`authorized_access`**, đã có:
  *"mọi access phải được đứng trước bởi một check PASS cho cùng subject **và** resource"*.
- `one_decision_on_every_path` → **`final_state`** trên
  `<endpoint>.authorization_decisions_on_document`, kỳ vọng 1 mỗi đường. Đường mới đứng ở 0 →
  vỡ.

**Phát hiện đáng giá:** `authorized_access` key theo **(subject, resource)**. Nghĩa là nếu tôi
mô hình hoá check của middleware là trên resource `document`, invariant sẽ **PASS** và
anti-fabrication gate sẽ bắt tôi vì tuyên bố một violation không xảy ra. Middleware check
resource `identity`, không phải `document`. **Chính sự tách resource đó là ranh giới
authentication ↔ object-level authorization** — engine không thể bị lừa để gộp hai thứ. Đúng
cái mà cách giải thích bị cấm số (2) muốn gộp.

## 9. Người xem phải NHÌN THẤY gì

Không phải "biết", mà **thấy**:

1. **Hai đường tới cùng một object** — và chúng không đối xứng.
2. **Một đường có một quyết định, đường kia có số không** — và số không đó là **chỗ trống chưa
   từng được lấp**, không phải một bước bị nhảy qua.
3. **Middleware chạy trên cả hai đường và làm đúng** — nếu người xem không thấy điều này, họ
   sẽ kết luận "thiếu authentication" (cách giải thích bị cấm số 2).
4. **Hai nhịp khác nhau**: một lần / mỗi request, so với một lần / mỗi đường. Đây là claim về
   **tần suất**, không phải về cấu trúc — và nó là aha của video.
5. **Một đường mới xuất hiện mà enforcement không đi cùng nó.** Đó là event nhân quả (e2).
   Thời gian trôi qua — "ba tháng" — chỉ là **thứ tự và bối cảnh thời gian**, không phải nguyên
   nhân. Cái gây ra lỗi là *một code path được thêm vào mà object-level authorization đang tồn
   tại không được đưa theo*, không phải việc đã trôi qua bao lâu. Nếu đường mới được thêm cùng
   ngày, lỗi y nguyên.
6. **Fix di chuyển chỗ đặt enforcement**, không thêm một bước. Nếu hình cho thấy "thêm một dòng
   vào handler mới" thì nó dạy đúng cái fix mà package đã loại.
7. **Ranh giới của detection** — độ phủ đếm số đường đã có quyết định, không phán quyết định đó
   đúng.

---

## Ba khác biệt buộc KHÔNG được mặc định dùng lại ngữ pháp thị giác của E01

E01 đã đóng băng và `cv recall` in ra 3 rejected device của nó. Nhưng rủi ro lớn hơn không
phải tái dùng device bị loại — mà tái dùng device **đã thành công**, vì nó trông như house
style. Ba khác biệt ngữ nghĩa chặn việc đó:

1. **Loại "vắng mặt" khác nhau.** E01: vắng mặt trong một **cấu trúc dữ liệu** (index không có
   thứ tự trên `lower(email)`) — vĩnh viễn và đúng theo định nghĩa. F01: vắng mặt trong một
   **đường thực thi** (một quyết định chưa từng được đặt) — mang tính lịch sử và bất đối xứng.
   Cột trống của E01 nói *"thứ này không tồn tại"*. Chỗ trống của F01 nói *"chỗ này chưa ai
   đặt gì vào"*. Dùng lại hình cột-trống của E01 sẽ nói sai câu.
2. **F01 có một trục THỜI ĐIỂM ĐƯỢC VIẾT RA, E01 không.** E01 hoàn toàn tĩnh: index và
   predicate cùng tồn tại, không có lịch sử. F01 có hai thời điểm tác giả khác nhau — đường cũ
   được viết kèm quyết định phân quyền, đường mới được viết mà không kèm. Trục này là **thứ tự
   tác giả**, không phải thời lượng: "ba tháng" chỉ là bối cảnh, còn nguyên nhân là *đường mới
   được thêm mà enforcement không đi cùng*.
3. **Aha của F01 là một claim về NHỊP**, không phải về cấu trúc. So sánh hai biểu thức cạnh nhau
   (E01) không diễn đạt được "một lần mỗi request so với một lần mỗi đường".

Và một khác biệt về format: **170s đề xuất / 145s tối thiểu**, so với 84s của E01 — gần gấp
đôi. Nhiều beat hơn nghĩa là rủi ro lặp lại cao hơn, và `cv variety` sẽ là công cụ thật chứ
không phải formality.

---

**Step 1 hoàn thành. Chưa bắt đầu Step 2.**
