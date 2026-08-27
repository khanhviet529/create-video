# H01 — Semantic Analysis

> **TRẠNG THÁI NGUỒN.** Phân tích này thực hiện trên snapshot đã tiêu thụ
> `85a9cae206606c10…` (validator bên sản xuất: 0 lỗi · 0 cảnh báo). Kể từ lúc đó Content
> Agent đã sửa Package 007 (Beat 21), nên `cv provenance` hiện báo **`SOURCE_CHANGED`**
> — source `f62837859b1d1a2f…`.
>
> **Chưa re-import.** Không dựng artifact nào chống lại snapshot này. Sau khi Beat 21 xong
> và 007 validate sạch, phải re-import qua đúng import contract, đọc lại package, và soát
> lại tài liệu này trước khi mở Step 3.

Không quyết định hình nào ở tài liệu này.

---

## 1. Cơ chế nhân quả chính

Package phát biểu (`core_claim`):

> Khi câu ghi và câu đọc được phục vụ ở **hai vị trí khác nhau trên cùng một replication log**,
> chữ *sau* không còn là một khái niệm xác định.

Đây **không** phải "replica chậm". `technical_notes[0]` loại cách nói đó khỏi toàn bộ package
một cách có chủ ý, kể cả khỏi phần research, vì nó dựng lại theo nghĩa đen thành một vấn đề
**hiệu năng** trong khi đây là vấn đề **vị trí**.

### Kiểm lại phát biểu được đề xuất

Wording đề xuất trong chỉ thị — *"wall-clock order ≠ observation/log-position order"* — đúng
hướng nhưng **thiếu một mệnh đề mà package coi là trọng tâm**. Package không nói hai thước đo
đó khác nhau nói chung. Nó nói (`story.aha.actually`):

> Với **một node**, hai cách đo đó **là một**. Với **hai node** thì không.

Nên hình dạng đúng không phải *"đồng hồ khác log"* mà là:

```
thêm node thứ hai  →  chữ "sau" TÁCH LÀM ĐÔI
                       (trước đó nó là một khái niệm duy nhất, và đúng)
```

`edge_cases[0]` chốt điều này: *"Chỉ một node: không tồn tại. Đây là cái giá xuất hiện đúng lúc
thêm node thứ hai."* Sự phân đôi **được sinh ra bởi kiến trúc**, không phải bởi độ trễ.

---

## 2. Điều kiện tiên quyết

Hai cái, cả hai đều là **trạng thái thường trực**, không phải sự kiện hỏng:

| id | điều kiện | vai trò package gán |
|---|---|---|
| `e1` | streaming replication mặc định **bất đồng bộ** → replica luôn ở vị trí ≤ primary | *"Luôn đúng, kể cả khi không ai gặp lỗi. Nó **ĐỊNH CỠ** cửa sổ chứ không tạo ra lỗi."* |
| `e2` | tầng route gửi câu đọc về replica và **không mang theo thông tin gì** về câu ghi vừa xảy ra | *"trạng thái mặc định sau khi thêm replica"* |

Cộng `assumptions`: PostgreSQL streaming replication mặc định · app route đọc→replica,
ghi→primary · **cùng một người dùng** vừa ghi vừa đọc · câu đọc xảy ra ngay sau trong cùng một
luồng submit-rồi-redirect.

---

## 3. Kích hoạt

`e3` — người dùng **bấm lưu**. Package gọi đúng tên: *"Hành động bình thường, và là thứ làm cái
giá lộ ra."* Kích hoạt không phải một thao tác bất thường; nó là thao tác thường nhất.

---

## 4. Nguyên nhân chính (khác với điều kiện tiên quyết)

`e5` — **tầng route đưa câu đọc kế tiếp về replica**.

> *"Đây là nguyên nhân chính — bỏ nó ra thì không có gì sai. **Ba trong bốn** vị trí đánh đổi
> đều nhắm vào đúng quyết định này."*

Đây là chốt nhân quả quan trọng nhất của package và là chỗ dễ dựng sai nhất: **độ trễ không
phải thủ phạm**. Nó là thước đo bề rộng cửa sổ. Thủ phạm — nếu buộc phải gọi tên — là một
quyết định route **không biết gì** về câu ghi vừa xảy ra.

---

## 5. Chuỗi hệ quả

```
e3  user bấm lưu
 └─ e4  primary commit ở vị trí 500          ← dữ liệu nằm nguyên ở đây
     e5  route đưa câu đọc kế tiếp về replica  ← NGUYÊN NHÂN CHÍNH
      └─ e6  replica phục vụ câu đọc ở vị trí 499
              "Đây là câu trả lời ĐÚNG cho vị trí của nó"
          └─ e7  user thấy giá trị TRƯỚC khi ghi   ← phá bảo đảm
              └─ e8  user báo lên bằng chữ "mất dữ liệu"  ← dấu hiệu, không phải cơ chế
```

`e1` (bất đồng bộ) cũng trỏ vào `e6`. Hai mũi tên vào cùng một hệ quả: **một điều kiện định cỡ
cửa sổ, một quyết định đẩy người dùng vào cửa sổ đó.** Cả hai đều cần; chỉ một là nguyên nhân.

---

## 6. Bảo đảm bị phá

Package khai **hai** invariant, ở hai mức:

| id | phát biểu | bị phá bởi |
|---|---|---|
| `read_your_writes` | ghi thành công rồi đọc lại thì phải thấy được cái mình vừa ghi | `e7` |
| `observation_order_matches_real_order` | A xảy ra trước B theo đồng hồ thì **mọi quan sát viên** đều thấy A trước B | `e6` |

Cái thứ hai là **dạng tổng quát**, cái thứ nhất là **tên gọi cụ thể** của thứ mất đi. Không mâu
thuẫn — đây là hai tầng của cùng một chuyện, và cái tổng quát mới là chỗ chữ *sau* tách đôi.

---

## 7. Cái gì vẫn đúng

Nhiều hơn ta tưởng, và package nhấn mạnh từng cái:

- **Không node nào hỏng.** `e6`: *"Đây là câu trả lời ĐÚNG cho vị trí của nó."* Beat 7:
  *"Cả hai đang trả lời đúng câu hỏi được đặt cho chúng."*
- **Không mất dữ liệu.** Giá trị mới nằm nguyên trên primary và sẽ hiện ra trên replica sau vài
  trăm ms. `stale ≠ lost`.
- **Eventual consistency vẫn được giữ đúng.** Replica **sẽ** bắt kịp.
- **Commit thành công thật.** `e4`: *"Dữ liệu nằm nguyên ở đây, không mất đi đâu."*
- **Không có bug.** `primary_fix`: *"Không có fix gốc rễ, vì không có lỗi."*

---

## 8. Bốn vị trí đánh đổi — NGANG HÀNG, không xếp hạng

Package nói thẳng: *"chúng không phải phương án dự phòng, **chúng ngang hàng**"*. Mỗi vị trí có
ba mặt, và mặt thứ ba là mặt hay bị bỏ.

| | vị trí | **mua được gì** | **trả bằng gì** | **không đổi gì** |
|---|---|---|---|---|
| **V1** | route những câu đọc cần thấy cái vừa ghi về primary | read-your-writes cho đúng những đường cần nó, không phải trả độ trễ ghi | trả lại một phần khả năng đọc vừa mua bằng replica; và **danh sách endpoint có thể sai mà không ai biết** | replication vẫn bất đồng bộ, độ trễ vẫn nguyên, mọi câu đọc khác vẫn ở replica. **Tri thức "câu nào cần" nằm trong đầu người viết code, không nằm trong hệ thống** |
| **V2** | theo dõi vị trí log theo phiên | *"chạm vào chính định nghĩa của chữ sau"* — biến *sau* thành thứ **so sánh được** | đắt về code (mang vị trí log xuyên các tầng); câu đọc **có thể phải chờ** | — vị trí **duy nhất không đòi ai phải BIẾT TRƯỚC** câu đọc nào cần |
| **V3** | `synchronous_commit = remote_apply` | chạm vào **precondition** (tính bất đồng bộ); phủ **mọi** câu đọc mà không cần biết câu nào cần | doc nói thẳng: *much larger commit delays*; và **độ bền đường ghi giờ phụ thuộc replica còn sống** | ba vị trí kia đổi **chỗ đọc**; vị trí này đổi **lúc ghi kết thúc** |
| **V4** | hiện luôn giá trị vừa gửi, không đọc lại | làm một **triệu chứng** biến mất; rẻ, nhanh, và là cách phần lớn sản phẩm thật đang làm | **KHÔNG sửa gì trong hệ thống**; tab thứ hai, thiết bị thứ hai vẫn thấy giá trị cũ | ba vị trí kia chạm vào một mắt xích trong **cơ chế**; vị trí này chạm vào **cái người dùng thấy** |

Trục phân biệt do chính package đặt ra, không phải do tôi áp:

```
V1, V2, V4  đổi CHỖ ĐỌC / cái người dùng thấy
V3          đổi LÚC GHI KẾT THÚC
```
```
V1  đòi biết trước câu nào cần        V2  không đòi biết trước
V3  không đòi biết trước              V4  không chạm vào cơ chế
```

---

## 9. Dấu hiệu phát hiện

**Cột đúng:** `replay_lag` trong `pg_stat_replication`. Doc mô tả là thời gian giữa flush WAL
cục bộ và lúc nhận báo standby đã *written, flushed **and applied*** — tức đúng con số quyết
định câu đọc trên replica **thấy được gì**.

**Ba cột, không hoán đổi được:**

| cột | nói về |
|---|---|
| `write_lag` | độ bền |
| `flush_lag` | độ bền |
| `replay_lag` | **khả năng nhìn thấy** |

**Signal ≠ diagnosis.** `replay_lag` cho biết **ĐỘ RỘNG** của cửa sổ. Nó **không** cho biết có
ai rơi vào cửa sổ đó hay không. Muốn biết điều thứ hai phải đo ở tầng ứng dụng: đếm số lần một
request đọc chạy trong vòng vài trăm ms sau một request ghi **của cùng người dùng**.

**Bốn false positive:**

1. **Primary rảnh** → cả ba con số về gần không vì **không có WAL mới để chép**, không phải vì
   replica đã bắt kịp.
2. Một câu ghi lớn vừa chạy → lag nhảy vọt rồi tự về, không liên quan read-your-writes.
3. Replica đang chạy query dài **chặn replay** → lag tăng vì lý do khác hẳn.
4. Mạng xấu đi → lag tăng nhưng cửa sổ vẫn có thể **nhỏ hơn** round trip của người dùng.

**Bốn điều `does_not_prove`:** `replay_lag` thấp không chứng minh an toàn (cửa sổ chỉ cần dài
bằng vài chục ms của submit-rồi-redirect) · `replay_lag` = 0 không chứng minh đã bắt kịp ·
`write_lag`/`flush_lag` không trả lời được câu hỏi này · **không con số nào** trong
`pg_stat_replication` cho biết bao nhiêu người dùng đã thật sự rơi vào cửa sổ.

---

## 10. Cặp beat không tách rời

Package khai ba cặp. Mỗi cặp, vế đầu **đứng một mình sẽ dạy ngược** điều nó định dạy.

| cặp | beat | vế đầu | vế sau bắt buộc |
|---|---|---|---|
| 1 | 13–14 | *"thường dưới một giây"* | *"khoảng giữa bấm lưu và câu đọc kế tiếp **cũng** dưới một giây"* → **hai khoảng chồng lên nhau** |
| 2 | 30–31 | `remote_apply` làm commit chờ tới khi replica thấy được | *much larger commit delays*, và **replica chết thì đường ghi đứng theo** |
| 3 | 32–33 | hiện luôn giá trị vừa gửi | **không sửa gì trong hệ thống**; tab thứ hai vẫn thấy giá trị cũ |

Cặp 1 là cặp nguy hiểm nhất: *"Đứng một mình, beat 13 dạy **NGƯỢC** lại điều nó định dạy —
dưới một giây nghe như hoàn toàn an toàn."*

**Cơ chế nằm ở chỗ CHỒNG NHAU của hai khoảng, không ở độ dài của khoảng nào.**

---

## 11. Giải thích bị loại

| bị loại | vì sao — và nó đẩy chẩn đoán đi đâu |
|---|---|
| **"Mất dữ liệu"** | không mất. Đây là **từ vựng của người báo lỗi**; tin theo nó đẩy chẩn đoán sang **tầng ghi** ngay từ đầu, tức sai hướng trước khi kịp nhìn vào tầng đọc. Đúng: dữ liệu **CŨ**, không phải dữ liệu **MẤT** |
| **"Replica chậm, nâng cấu hình là hết"** | không phải vấn đề hiệu năng. Nâng cấu hình **THU HẸP** cửa sổ chứ không **ĐÓNG** nó, và cửa sổ chỉ cần dài bằng một round trip |
| **"Eventual consistency thì phải chịu thôi"** | gộp **ba** bảo đảm khác nhau thành một. EC vẫn đang được giữ đúng. Cách nói này **biến một lựa chọn thành một định mệnh** |
| **"`synchronous_commit` đang là `on` nên đã đồng bộ rồi"** | `on` là **mặc định**, và chỉ có hiệu lực với standby đồng bộ. Không đặt `synchronous_standby_names` thì **không có standby đồng bộ nào để chờ**. Đây là **bẫy tên gọi thật trong sản phẩm** — package nói nó **nguy hiểm hơn ba cái trên** |

`technical_notes[1]`: narration **cố ý không nhắc** `synchronous_commit = on`, chỉ nhắc
`remote_apply` — vì `remote_apply` là một giá trị cụ thể và không mơ hồ.

`technical_notes[2]`: chữ *"mất dữ liệu"* **có** trong narration, nhưng được gán cho **người báo
lỗi** ở beat 4 rồi bác ngay ở beat 5. Đây là cách dùng **có kiểm soát** một từ vựng sai.

---

## 12. Mơ hồ thuật ngữ và mâu thuẫn

Bốn chỗ, ghi lại thay vì tự hoà giải.

### A. Beat 21 nói "ba bảo đảm" nhưng chỉ nêu tên hai

> *"eventual consistency vẫn đang được giữ đúng. Đây là **ba** bảo đảm khác nhau. Mất cái này
> không bắt buộc phải mất cái kia."*

Trong beat có **eventual consistency** + *"cái này / cái kia"* = hai chỉ danh. Cái thứ ba chỉ
truy được từ `edge_cases[1]`: **monotonic reads**. Nó **không xuất hiện** trong narration.

**Ràng buộc cho Step 3/4:** hình không được hiện đúng hai vật lúc lời nói "ba", và cũng không
được **đặt tên** một bảo đảm thứ ba mà narration chưa từng gọi tên. Đây là bài toán hình học
phải giải, không phải chỗ để viết thêm chữ.

### B. `technical_truth.invariant_broken` (một) vs `semantic_model.invariants` (hai)

Không mâu thuẫn — mục 6. Nhưng chú ý: chỉ `read_your_writes` được **gọi tên** trong narration
(beat 20). `observation_order_matches_real_order` **không có tên** trong lời, dù nó chính là
thứ beat 16–19 mô tả.

### C. "Cùng người dùng" là điều kiện định danh cho tên gọi

`assumptions[4]` + `edge_cases[1]`: người **khác** đọc thì bảo đảm bị phá có **tên khác** —
monotonic reads, hoặc chỉ là dữ liệu cũ. Nên mọi hình phải giữ được **cùng một quan sát viên**
đi qua cả ghi lẫn đọc; đổi quan sát viên là đổi chủ đề.

### D. Vị trí 500 / 499 là **số ví dụ**, không phải phép đo

`assumptions[5]` và `technical_notes[4]` nói hai lần. *"khoảng cách một nhịp"*. Con số **duy
nhất có nguồn** trong narration là **"thường dưới một giây"**.

---

## 13. Giả định của video

`open_questions` khai ba chỗ chưa có cơ sở, và video **cố ý không phát biểu** về chúng:

1. **Logical replication** chưa verify — cùng hình dạng vấn đề, tham số khác.
2. **Tầng route của framework phổ biến ở VN** (Laravel read/write connection, Rails role-based
   switching, Spring `AbstractRoutingDataSource`) chưa khảo sát — đây là thứ quyết định V1 rẻ
   tới mức nào trong thực tế.
3. **Tỉ lệ request rơi vào cửa sổ** chưa có cơ sở. Video *"cố ý chỉ nói cửa sổ rộng bao nhiêu
   và cách đo, không nêu tỉ lệ nào"*.

`confidence: high`.

---

## 14. Semantic replay — **NON-AUTHORITATIVE** cho Package 007

> **ĐỌC KỸ TRƯỚC KHI TRÍCH SỐ TỪ MỤC NÀY.**
>
> Kết quả `0/7 invariant bị phá` dưới đây **KHÔNG** có nghĩa là cơ chế đã được mô hình hoá an
> toàn. Nó có nghĩa **ngược lại**: dụng cụ không với tới được cơ chế. Một replay **đạt** trên
> một trace **chính là cái lỗi** là bằng chứng chống lại dụng cụ, không phải chứng chỉ cho nội
> dung.
>
> Trạng thái chốt: **semantic replay là NON-AUTHORITATIVE cho Package 007.** Không dùng nó làm
> căn cứ để tuyên bố bất cứ điều gì về tính đúng đắn của H01. Bốn khoảng thiếu ở dưới là **nợ
> tooling generalizable của Video Engine**, không phải khuyết tật của Content Package.
>
> **Không mở rộng replay** cho tới khi Step 3 chứng minh là cần.


Chỉ thị: *"run/reuse semantic replay if the current replay system can model the mechanism. If it
cannot, report the limitation **before** changing tooling."*

Đã chạy. **Không đổi tooling.**

### Trace thì diễn đạt được

Mô hình hoá được: hai kho (`primary.*`, `replica.*`), commit ở primary, câu đọc phục vụ từ
replica, replica replay sau. Replay chạy sạch, **không lỗi mô hình**, và trace **ghi đúng sự
thật**: câu đọc `e6` quan sát được `{"value": 0, "version": 0}` — tức **giá trị trước khi ghi**.

### Nhưng không invariant nào phát biểu được nó

Bảy invariant thuộc mọi `kind` có liên quan, chạy trên trace **chính là cái lỗi**:

```
  ĐẠT  primary_ends_correct    primary.value = 1
  ĐẠT  replica_catches_up      replica.value = 1
  ĐẠT  nothing_clobbered       every write saw the value it overwrote
  ĐẠT  primary_pos_rises       primary.pos never fell — 500 at the end
  ĐẠT  replica_pos_rises       replica.pos never fell — 500 at the end
  ĐẠT  replica_value_rises     replica.value never fell — 1 at the end
  ĐẠT  no_stale_basis_write    no interleaved read-modify-write windows

  => 0/7 invariant bị phá bởi một trace CHÍNH LÀ cái lỗi.
```

Đây **đúng cùng hình dạng** với probe `1200 → 900 → 1200` đã sinh ra `monotonic` ở G01: sự thật
nằm trong trace, mà không dụng cụ nào chỉ được vào nó.

### Thiếu chính xác cái gì

**Thiếu 1 — không có định danh logic xuyên kho.** `primary.value` và `replica.value` là **cùng
một dữ liệu ở hai vị trí**, không phải hai field độc lập. Mô hình không có cách nào phát biểu
điều đó, nên nó không thể biết câu đọc từ `replica` đáng lẽ phải thấy cái đã ghi vào `primary`.

**Thiếu 2 — không có kỳ vọng nhân quả theo từng actor cho ĐỌC.** Mô hình đã có `readBasis` per
actor (dùng để bắt stale write), tức **một nửa cơ cấu đã có sẵn**. Cái thiếu là chiều ngược
lại: một *write basis* mà mọi câu đọc sau đó **của cùng actor** không được rơi xuống dưới.

**Thiếu 3 — chỉ có MỘT hệ quy chiếu.** Mô hình có đúng một trục thứ tự (thứ tự sự kiện). Bảo
đảm `observation_order_matches_real_order` đòi **so sánh hai hệ quy chiếu** — đồng hồ và vị trí
log. Không có chỗ nào trong mô hình để đặt hệ thứ hai.

**Thiếu 4 — assertion dạng tập hợp không được hỗ trợ.** `semantic_model.assertions` của package
dùng bốn op — `count_equals`, `contains`, `not_contains`, `not_equals` — trên `dataset`.
`simulate.mjs` **không cài đặt op nào trong bốn**. Bốn khẳng định về ba cột lag (mục 9) hiện
**không kiểm được**.

### Ghi chú đáng giá

Thiếu 3 và **cú aha của video là cùng một khoảng trống**. Replay không thấy được lỗi vì nó chỉ
có một hệ quy chiếu; người xem không tin có lỗi vì họ cũng chỉ có một. Đây là thứ Step 2 phải
khai thác, và là lý do mạnh để mở rộng replay **theo đúng hình dạng đó** — nhưng chỉ sau khi
Step 2 được duyệt.

### Nợ tooling (generalizable, không riêng 007)

Bốn khoảng thiếu ở trên **không** đặc thù cho chủ đề replication. Chúng là năng lực còn thiếu
của Video Engine và sẽ tái xuất hiện ở mọi package có nhiều hơn một quan sát viên:

| # | thiếu | package nào cũng chạm phải khi… |
|---|---|---|
| 1 | định danh logic xuyên kho | cùng một dữ liệu tồn tại ở nhiều nơi với độ mới khác nhau |
| 2 | write-basis theo actor cho chiều ĐỌC | có bảo đảm dạng "cái tôi vừa ghi thì tôi phải đọc lại được" |
| 3 | hệ quy chiếu thứ hai | thứ tự phụ thuộc vào việc đo bằng gì |
| 4 | op assertion dạng tập hợp | package khai `dataset` + `count_equals`/`contains`/`not_contains`/`not_equals` |

Thiếu 2 đáng chú ý: mô hình **đã có** `readBasis` theo actor (dùng để bắt stale write), tức
**một nửa cơ cấu có sẵn**; cái thiếu là chiều ngược lại.

**Liên hệ với G01 — giữ lại làm mẫu nhận dạng.** Đây đúng cùng hình dạng với probe
`1200 → 900 → 1200` đã sinh ra invariant `monotonic`: mọi invariant đang có đều **đạt** trên một
trace mà ai đọc kỹ cũng thấy là sai. Cả hai lần, dấu hiệu nhận biết là **sự thật nằm trong trace
mà không dụng cụ nào chỉ được vào nó**. Khi mẫu này xuất hiện lần thứ ba, nó không còn là sự
trùng hợp mà là một lỗ hổng có hệ thống trong cách khai invariant.

**Quy tắc rút ra:** một bộ replay báo *đạt hết* trên trace tái hiện sự cố phải được đọc là
**chưa mô hình hoá được**, không phải *đã sạch*. Cần một cách khai rõ ràng cho tình trạng đó —
hiện chưa có, nên phải ghi bằng tay như tài liệu này.

---

## 15. Chốt ngữ nghĩa mang sang Step 2

1. **Không dạy "replica chậm".** Hiệu năng đổi **bề rộng** cửa sổ, không định nghĩa bảo đảm.
   Replica nhanh gấp mười lần vẫn có một khoảng trễ khác không.
2. **`stale` ≠ `lost`.** Giá trị đã commit nằm nguyên trên primary.
3. **Eventual consistency KHÔNG bị phá.** Không được gộp các bảo đảm thành một trạng thái nhị
   phân "nhất quán / không nhất quán".
4. **Không được ngụ ý `synchronous_commit = on` nghĩa là replication đồng bộ.**
5. **Bốn vị trí là NGANG HÀNG.** Không có "cách sửa tốt nhất + ba cái yếu hơn".
6. **500/499 là vị trí, không phải tốc độ.** Không đua, không thanh nhanh-chậm, không đồng hồ
   tốc độ.
7. **Cùng một quan sát viên** phải đi qua cả ghi lẫn đọc; đổi quan sát viên là đổi chủ đề.
8. **Cửa sổ chồng nhau là cơ chế** — không phải độ dài của một khoảng.
9. **Nguyên nhân chính là quyết định route không biết gì về câu ghi**, không phải độ trễ.
10. **`replay_lag` thấp ≠ an toàn**, và **`replay_lag` ≈ 0 có thể chỉ nghĩa là không có WAL mới**.
