# F01 — Step 2: Visual Strategy

Package `004-authz-per-object-not-per-request` · 170s đề xuất / 145s tối thiểu
Đọc trước: [SEMANTIC_ANALYSIS.md](SEMANTIC_ANALYSIS.md) · `cv recall` (E01 = FROZEN_BENCHMARK, 3 rejected devices)

Chưa dựng shot nào. Tài liệu này định **ngữ pháp**, không định composition.

---

## 1. Vật liệu, suy ra từ ngữ nghĩa

Câu hỏi không phải "vẽ authorization thế nào" mà **"đơn vị thông tin ở đây là gì".**

Ở E01 đơn vị thông tin là một chuỗi có thứ tự, nên typography là vật liệu — một dấu mark không
tra cứu được và không cho thấy CAROL sắp trước alice.

Ở F01, sự thật nhân quả là: **một đường đi tồn tại, và thân của nó có hay không có một quyết
định phân quyền.** Đường đi ở đây không phải topology — nó là **một handler đã được ai đó
viết ra**. Quyết định phân quyền không phải một trạng thái — nó là **một dòng code có thể gọi
và có thể từ chối**.

> **Vật liệu là code đã được tác giả viết ra.** Không phải sơ đồ code, không phải pseudo-code
> minh hoạ — thân handler thật, đọc được, hoàn chỉnh.

Đó là register duy nhất mà "chưa từng có ở đó" phát biểu được. Trong một sơ đồ, vắng mặt phải
vẽ thành một ô trống; trong một thân hàm, vắng mặt là **một dòng không được viết**, và thân hàm
đó vẫn trông hoàn chỉnh, vẫn chạy đúng, vẫn qua review.

Vật liệu thứ hai, chỉ dùng ở đúng một chỗ: **numerals**, khi claim là số học (nhịp, độ phủ).

## 2. Vì sao loại từng default — theo ngữ nghĩa, không theo lệnh cấm

| Default | Vì sao nó SAI với cơ chế này |
|---|---|
| **Boundary diagram** | Hàm ý có một chu vi bị vượt qua. Không có gì bị vượt qua — request đi qua cửa trước hợp pháp, xác thực thành công. Hình chu vi dạy "tường có lỗ", sai cơ chế. |
| **Ổ khoá** | Ổ khoá mang trạng thái *đang khoá / đang mở*. Ở đây không có ổ khoá nào đang mở — **không có ổ khoá nào được lắp**. Khoá mở là banned explanation (3). |
| **Sơ đồ hai người dùng** | Đặt cơ chế vào **con người**. Kịch bản không có ai đoán gì: id lấy hợp pháp từ hồi còn là thành viên. Hình attacker-vs-victim dạy banned explanation (1). |
| **Box + arrow / route flowchart** | Render đường đi thành topology. Nhưng sự thật nhân quả nằm trong **thân handler**, không trong topology. Flowchart cho thấy cả hai đường đều tới object và **không thể** cho thấy thân này có dòng kiểm, thân kia không — nó buộc tôi vẽ một "ô thiếu", tức là một bước bị nhảy qua. |
| **Dashboard** | Độ phủ là tín hiệu phát hiện. Dashboard biến *số đường chưa ai kiểm* thành *điểm sức khoẻ* — chế tạo ra đúng `false_safety` mà package lấy làm hook để phá. |

## 3. Vì sao KHÔNG dùng lại ngữ pháp E01 dù nó đã chạy tốt

Rủi ro lớn hơn không phải device bị loại — mà device **đã thành công**, vì nó trông như house
style. Ba cái phải chủ động từ chối:

- **Hai cột cạnh nhau, một cột rỗng** (E01 hero). Cột rỗng của E01 nói *"thứ này không tồn tại
  và không thể tồn tại"*. F01 cần nói *"chỗ này chưa ai đặt gì vào, và đặt được"*. Cùng một
  hình, hai câu khác nhau. Dùng lại là nói sai câu.
- **Match cut giữa hai shot cùng khung hình** (E01 06→07). Nó hoạt động vì fix của E01 đổi
  **một ký tự** trong một biểu thức tĩnh. Fix của F01 **di chuyển** một nghĩa vụ sang một tầng
  khác — khung hình phải đổi, và đó là nội dung.
- **`--counterfactual` cho giá trị đang tìm.** F01 không có counterfactual value nào; không có
  gì "lẽ ra phải ở đây".

Và một ràng buộc suy ra từ chính khung 1080: lề 93 hai bên còn 894px; mono advance 0.6em nên ở
36px được ~41 ký tự/dòng. **Hai thân handler không thể đặt cạnh nhau** (còn ~20 ký tự mỗi bên,
không đọc được code). Chúng phải **xếp dọc**. Ràng buộc kỹ thuật này tự loại luôn bố cục
so-sánh-ngang của E01 — tiện, nhưng lý do thật vẫn là lý do ngữ nghĩa ở trên.

## 4. Đối tượng người xem theo dõi

**Chính: một quyết định phân quyền trên object.** Một thứ duy nhất, theo suốt 170s:

| phase | nó ở đâu |
|---|---|
| symptom | không thấy — chỉ thấy **hệ quả** của nó: đường cũ trả 403 |
| authoring | thấy nó: **một dòng trong thân handler 1** |
| cadence | **đếm** nó: cần 1 mỗi đường, đang có 1 trên 2 |
| fix | nó thôi là thứ **mỗi đường phải mang**, thành thứ **mọi truy cập thừa hưởng** |
| cost | thấy lối đi **không** cần nó — job nền, một chỗ, có tên |
| detection | đếm xem bao nhiêu đường **có** nó |

**Phụ: bản kê các đường đi.** Thứ tăng lên. Nó là danh sách handler thật, không phải metric.

Một object theo suốt là điều kiện sống của video 170s. Không có nó thì 170s thành một danh
sách chủ đề.

## 5. "Chưa từng có ở đó" — bốn luật

Đây là yêu cầu khó nhất. Một bước *bị bỏ qua* trông như: có một thứ trong chuỗi, và luồng nhảy
qua nó. Bốn luật để không bao giờ vẽ ra hình đó:

1. **Không bao giờ vẽ ô trống, placeholder, hay viền nét đứt ở chỗ quyết định "lẽ ra" nằm.**
   Một placeholder khẳng định vị trí đó tồn tại — và từ đó tới "bước này bị nhảy qua" chỉ còn
   một bước. Handler 2 không có chỗ trống nào; nó chỉ **không có dòng đó**.
2. **Vắng mặt chỉ đọc được bằng cách so sánh hai thân hàm, cả hai đều hoàn chỉnh.** Handler 2
   không dở dang. Nó là code xong việc, chạy đúng, đã qua review, làm chính xác điều nó nói.
   Đó mới là chỗ đáng sợ: **không có gì trông sai**.
3. **Sự tồn tại của dòng kiểm được xác lập như một HÀNH VI TÁC GIẢ mà người xem đã xem xảy
   ra.** Nó nằm trong handler 1 vì có người viết nó vào đó. Rồi handler 2 được viết ra, và dòng
   đó **không được gõ**. Không có chuyển động nào "vượt qua" cái gì — chỉ có một dòng không
   được viết.
4. **`principal` phải thấy được là ĐANG CÓ trong scope của handler 2 và không được dùng.**
   Vắng mặt ở đây là **thiếu câu hỏi**, không phải thiếu thông tin. Luật này làm hai việc cùng
   lúc: nó chặn banned explanation (2) — "thiếu authentication" — và nó biến vắng mặt từ *thiếu
   dữ liệu* thành *không ai hỏi*.

Hệ quả về chuyển động: **không có motion nào được đi qua, nhảy qua, hay vòng quanh cái gì.** Ngữ
pháp chuyển động của video này là **xuất hiện và tích tụ** (tác giả viết thêm), không phải
**đi qua** (request chạy). Đây là ràng buộc mạnh nhất mà Step 3 phải tôn trọng.

## 6. Authentication vs (subject, resource) authorization — không dùng sơ đồ tầng

Không vẽ tầng. Khác biệt là **PHẠM VI của một câu trả lời**:

- **"Anh là ai" — trả lời một lần, và câu trả lời có phạm vi = cả request.** Người xem thấy
  điều này vì `principal` **có mặt trong scope của cả hai** thân handler. Không phải vì có ai
  vẽ một hộp middleware ở trên.
- **"Anh được chạm vào object này không" — chỉ xảy ra nếu có ai HỎI.** Câu trả lời, một khi
  có, nói về (subject, resource, action) và áp được cho bất kỳ đường nào — nó KHÔNG hết hạn
  theo đường đi. Chỗ hỏng là đường mới **không bao giờ hỏi**.

Đó là khác biệt về **ai phải hỏi**, không phải về phạm vi câu trả lời, và cũng không phải về
số lần gõ tay.

> **Đã sửa lần hai trong Step 3.** Bản trước của mục này viết "câu trả lời có phạm vi = một
> lần truy cập, không nới ra cho đường khác". Sai. Một quyết định phân quyền về (subject,
> resource) áp được cho mọi đường — chính vì thế enforcement tập trung mới hoạt động. Package
> viết "phải được HỎI LẠI ở mỗi đường", tức là về hành vi hỏi, không về hạn dùng của câu trả
> lời. Đọc sai đó đã sinh ra một direction cho aha và direction đó bị loại (xem Step 3).

Ranh giới này quan trọng vì invariant của package nói *"mọi đường đi tới dữ liệu của một object đều phải qua **cùng một**
quyết định phân quyền"* — **cùng một**, nên enforcement hoàn toàn có thể tập trung.

Replay engine ép đúng ranh giới này: `authorized_access` key theo (subject, **resource**). Nếu
mô hình hoá check của middleware trên resource `document` thì invariant PASS và
anti-fabrication gate bắt ngay. Hình và semantic model nói cùng một điều vì cùng bị một luật
ràng.

## 7. Aha: ĐƯỢC GIAO so với PHẢI HỎI

Claim không phải "câu trả lời hết hạn". Nó là: **một câu được trả lời dù bạn có hỏi hay không;
câu kia chỉ được trả lời nếu có ai hỏi.**

- `req.principal` **được giao tới**. Middleware đặt nó ở đó. Nó có mặt trong mọi thân handler,
  dùng hay không dùng. Một đường mới nhận nó mà không ai làm gì.
- Quyết định phân quyền trên tài liệu là **một hành vi**. Nó chỉ xảy ra nếu thân handler thực
  hiện nó. Một đường mới **không** thừa hưởng hành vi.

Khác biệt vì thế là ngữ pháp: một cái là **danh từ bạn nhận được**, cái kia là **động từ bạn
phải làm**. P1 đã chứa cả hai vật liệu đó rồi và không cần thêm gì để nói điều này.

Và nó làm fix đọc được ngay: fix biến quyết định phân quyền từ **động từ phải làm** thành
**thứ được giao tới** — đó chính là `thừa hưởng` mà package nêu, không phải bất khả thi.

Chống thành dashboard: nếu có số, chúng là **đếm những thứ đang hiện trên khung** — chính danh
sách đường mà người xem đã theo dõi. Không có điểm số, không có màu xanh/đỏ sức khoẻ.

### 7a. Ranh giới bắt buộc: cái gì là luật chung, cái gì là của riêng kịch bản này

Đây là chỗ Step 2 đã vượt package và đã bị khoá lại.

| | phát biểu |
|---|---|
| **Luật chung** | Mọi truy cập tới object được bảo vệ đều phải chịu quyết định phân quyền cần thiết. **Chỗ đặt enforcement là lựa chọn kiến trúc** — tập trung, policy-based, scope ở tầng truy cập dữ liệu, middleware hỗ trợ, guard, decorator. Package liệt kê các phương án này trong `alternatives` và phản đối chúng vì **opt-in / độ phủ**, không vì chỗ đặt. |
| **Của riêng kịch bản** | `assumptions` của package: *"Kiểm quyền hiện được viết thủ công trong từng handler"* và *"Không có tầng nào ép buộc kiểm quyền lúc nạp dữ liệu"*. Vì thế trong codebase NÀY, mỗi đường mang một bản kiểm riêng, và 1-trên-2 là đếm được. |

**Video không được dạy** "object authorization phải được nhân bản thủ công ở mỗi handler". Đó là
tình trạng của codebase trong kịch bản, không phải yêu cầu của cơ chế. Hình 1-trên-2 vẫn dùng
được, nhưng nó nói *"ở đây đang là 1 trên 2"*, không nói *"phải là 1 mỗi đường"*.

## 8. Fix: nghĩa vụ chuyển từ trí nhớ sang thừa hưởng

Hình của fix, ở mức ngữ pháp (composition là việc của Step 3).

Điều package khẳng định, và chỉ điều đó:

1. **Thực thi quyền sở hữu bản ghi, mặc định từ chối** — nguồn là OWASP A01, hai vế.
2. **Một đường truy cập mới được thêm vào không được âm thầm bỏ qua quyết định đó.**
3. **Endpoint thêm sau thừa hưởng. Không ai phải nhớ.**

Cơ chế của fix là **THỪA HƯỞNG**, không phải bất khả thi. Đó là cái hình phải chở: một đường
mới xuất hiện và **đã** chịu quyết định đó rồi, mà không ai làm gì thêm.

**Một cách làm — không phải cách duy nhất.** Package viết nguyên văn *"Một cách làm cụ thể:
repository nhận principal chứ không nhận mỗi id"*, và `technical_notes` ghi rõ narration đã
scope bằng cụm "một cách làm". Nếu hình này được dùng, nó phải xuất hiện **như một ví dụ**, và
tuyệt đối không như kiến trúc mà video kê đơn.

> **Đã loại khỏi Step 2:** "một dòng thì quên được, một tham số bắt buộc thì không". Không có ở
> đâu trong package. Đó là Visual Engine tự phát minh một bảo đảm kỹ thuật (bất khả thi lúc
> compile) — và nó còn không đúng phổ quát: JS, Python không ép gì cả. Visual Engine không
> chọn kiến trúc thay Content Engine.

Đây vẫn là **thay đổi không gian duy nhất** của video, và là chỗ duy nhất camera làm việc lớn:
enforcement thôi nằm *trên* từng đường, chuyển xuống chỗ mọi truy cập đi qua — `local_to_global`.

Trade-off nói được trong cùng ngữ pháp: lối đặc quyền cho job nền là **một lối có tên, ở một
chỗ**. Không phải lỗ trên tường — một cửa bạn tự dựng và canh được.

## 9. Modality nào được ngữ nghĩa cho phép, ở đâu

| Modality | Được phép ở | Vì sao earned |
|---|---|---|
| **Code là vật liệu** | authoring · fix · cost · detection | đường đi CHÍNH LÀ thân handler; vắng mặt chỉ phát biểu được trong text đã tác giả |
| **Numerals là chủ thể** | aha nhịp · độ phủ | claim là số học: 1/request vs 1/đường; n trên N |
| **Response payload** (gần UI) | **đúng hai lần**: hook và e7 | rò rỉ phải *cảm* được một lần. Dùng nhiều hơn là biến video thành demo app |
| **Tĩnh** | mọi phase đọc code · so sánh bằng chứng · ending | đọc cạnh tranh với chuyển động; so sánh cần khung bất động |
| **Camera `one_to_many`** | khi bản kê đường dài ra | đúng nghĩa one→many; là nửa không gian của aha |
| **Camera `local_to_global`** | đúng một lần, ở fix | quyết định rời một đường sang tầng mọi đường đi qua |
| **Đổi không gian** | đúng một lần, ở fix | di dời thật duy nhất trong video |
| **Không camera** | mọi chỗ còn lại | 170s toàn camera động thì các lần đổi register không còn đọc được |

Cấm tuyệt đối: chuyển động **đi qua / nhảy qua / vòng quanh** (xem §5). Và không dùng
`--ink-ghost` làm màu chữ (lint đã bắt 4 lần).

## 10. Hành trình biểu diễn qua ~170s

Bảy register. Chuyển register là chuyển **cái gì đang trên màn hình**, không phải chuyển camera
— vì hai register chính khác nhau ở **thời điểm** (lúc chạy vs lúc viết), và camera diễn đạt
không gian, không diễn đạt thời gian.

| # | Register | Ngân sách | Cái gì trên màn hình | Nhịp |
|---|---|---|---|---|
| A | **Triệu chứng** — lúc chạy | 28s | response: 403 ở một đường, 200 + payload ở đường kia | nhanh, 3 nhịp — đây là loại trừ |
| B | **Tác giả** — lúc viết | 38s | hai thân handler xếp dọc, cả hai hoàn chỉnh; `principal` có mặt ở cả hai | **chậm nhất trong video** — 2 nhịp dài, để đọc |
| C | **Nhịp** — aha | 22s | numerals: 1/request vs 1/đường; bản kê đường dài ra | dồn, có một khoảng lặng |
| D | **Thu phạm vi** — cái fix KHÔNG phải | 20s | id là UUID · "thêm một dòng" bị gạch | nhanh nhất — đây là những lời từ chối |
| E | **Di dời** — fix | 22s | dòng kiểm rời thân handler, thành tham số bắt buộc | một động tác lớn, rồi giữ |
| F | **Giá + giới hạn** | 32s | loader đặc quyền có tên; bản kê những gì fix KHÔNG phủ; test + độ phủ | đều, không kịch tính |
| G | **Câu hỏi** | 8s | trả về phía người xem | giữ, im |

≈ 170s. Ranh giới shot là việc của Step 4; đây là ngân sách register.

**Thứ tự chịu lực:** A → B là động tác chính của video. Triệu chứng quan sát được nhường chỗ
cho **lịch sử tác giả**. Nguyên nhân chỉ tồn tại trong register B, và người xem phải ở trong đó
đủ lâu — 38s, dài nhất — nên B là chỗ duy nhất được phép có shot ~20s.

## 11. Nhịp cho 170s — và vì sao không kéo giãn nhịp E01

E01: 8 shot, ~10.5s mỗi shot, gần như đều. Đúng cho 84s một cơ chế, một phép so sánh.

170s với nhịp đều 10s = 17 nhịp thay thế được nhau = **một danh sách**. Đó là chế độ hỏng của
video dài, và nó không lộ ra ở từng shot — chỉ lộ khi xem liền.

Đề xuất: **~14 shot, biên độ 6s–20s**, và biên độ chính là câu trả lời:

- **Dài nhất (18–20s)** ở register B. Người xem đang đọc code và phải được cho phép đọc. Nội
  dung đổi *trong* cùng một khung (handler 2 được viết ra ngay đó) thay vì đổi bằng cắt — nên
  shot dài mà không tĩnh.
- **Ngắn nhất (6–7s)** ở register D. "Không phải id", "không phải thêm một dòng" là những lời
  **từ chối**. Từ chối phải nhanh; giữ lâu một lời phủ định là mời người xem cân nhắc nó.
- **Trung bình (10–14s)** ở A, C, E, F.

Rủi ro lặp lại, ghi trước để Step 4 khai `intentional_repetition`: register code chở 4 trong 7
phase, nên `cv variety` **sẽ** báo các shot đó gần nhau. Điều phải đúng là mỗi phase code làm
một **phép toán khác** trên cùng vật liệu — so sánh (B) · đếm (C) · di dời (E) · liệt kê giới
hạn (F). Nếu hai phase code chỉ khác nội dung chữ mà cùng phép toán, một trong hai phải bị bỏ.

---

## Rủi ro đã biết, chuyển sang Step 3

1. **Register B là toàn bộ video.** Nếu hai thân handler không đọc được ở 1080×1920 thì chiến
   lược này sụp. ~41 ký tự/dòng ở mono 36px. Code phải là **code thật đã rút gọn**, không phải
   code framework thật — và rút gọn mà vẫn giữ được "trông hoàn chỉnh" (luật §5.2) là chỗ khó
   nhất của Step 3. Đây là thứ đầu tiên phải prototype.
2. **Luật §5.4 (`principal` có trong scope, không dùng)** phải đọc được mà không cần narration
   chỉ vào. Nếu nó cần một mũi tên hay một nhãn "chưa dùng", nó đã thất bại.
3. **Aha nhịp** là claim về tần suất trên một vật liệu tĩnh. Chưa có tiền lệ trong thư viện —
   A01/C01/E01 đều là claim cấu trúc. Đây là rủi ro sáng tạo cao nhất, và là ứng viên cho
   nhiều hơn một direction ở Step 3.
4. **F là 32s và không có kịch tính.** Giá, giới hạn, detection, ranh giới-không-chứng-minh-gì
   — bốn thứ đều là dè dặt. Đây là chỗ dễ nhất để mất người xem, và chưa có ý tưởng nào cho nó.

**Step 2 hoàn thành. Chưa bắt đầu Step 3.**
