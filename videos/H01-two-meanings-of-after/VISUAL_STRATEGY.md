# H01 — Visual Strategy (Step 2, bản bù độ phủ)

Chạy theo `docs/VISUAL_ENGINE_V2.1.md`. Benchmark đầu tiên thử
**thế giới bền + biến đổi biểu diễn + leo thang không gian** cùng lúc.

Không dựng gì. Không prototype. Không voice. Không re-import.

> **TRẠNG THÁI NGUỒN — `CURRENT`.** Re-import qua đúng import contract sau khi Content Agent
> chốt Beat 21. Snapshot immutable: `f62837859b1d1a2f…` · 31277 bytes · LF thuần · validator
> bên sản xuất 0 lỗi · 0 cảnh báo. Bản ghi provenance bị thay thế được giữ ở
> `PROVENANCE.superseded-85a9cae2.yaml` để chuỗi "phân tích nào đọc bytes nào" không đứt.
>
> **Beat 21 chốt: "ba" → "HAI".** Bảo đảm thứ ba (monotonic reads) ở nguyên `edge_cases`,
> **không** vào narration, **không** được dựng, **không** được đặt tên bằng hình.

---

## 1. Đối tượng theo dõi chính

> **Một lần quan sát: một dấu mang hai toạ độ — *lúc nó xảy ra*, và *vị trí trên lịch sử dùng
> chung mà nó được phục vụ*.**

Một vật, không phải một danh sách. Commit là một quan sát. Câu đọc là một quan sát. Lần replay
là một quan sát. `replay_lag` là **khoảng cách giữa hai quan sát**. Bốn vị trí đánh đổi là bốn
cách **dời một quan sát** trong trường. Chương phát hiện hỏi **khoảng cách nào dụng cụ chạm tới
được**. Không beat nào của package nằm ngoài định nghĩa này.

---

## 2. Thế giới bền

**Một trường hai trục.** Ngang = **đồng hồ**. Dọc = **vị trí trên lịch sử dùng chung**.
Lịch sử là **một**. Không hộp, không mũi tên, không icon database — topology không phải cơ chế,
toạ độ mới là.

Ba loại vật, không thêm:

- **dấu quan sát** — commit, câu đọc, lần replay
- **đường của một node** — vị trí node đó đứng theo thời gian
- **khoảng** — bề rộng theo đồng hồ, hoặc thiếu hụt theo vị trí

Người dùng · app · primary · replica **không phải hộp**; chúng là đường và dấu trong trường.

---

## 3. R9 — CỬA VÀO: trường phải được SINH RA từ trải nghiệm, không được cho sẵn

Không mở màn bằng một trường toán học chưa ai hỏi tới. Cửa vào đi theo đúng thứ tự beat:

| beat | trên màn hình | trục nào tồn tại |
|---|---|---|
| 1–3 | một giá trị trong giao diện: lưu → refresh → **giá trị cũ quay lại** | chưa có trục nào |
| 4–5 | *"họ gọi đó là mất dữ liệu"* → *"không có gì mất"* | chưa có trục nào |
| 6–7 | hai lần chạm đó rút về **hai dấu trên một đường thời gian** — lưu ở đây, đọc ở kia | **một trục: đồng hồ.** Đây là mô hình người xem đã có sẵn, không cần dạy |
| 7 | *"cả hai đang trả lời đúng câu hỏi được đặt cho chúng"* → **trục đồng hồ không trả lời nổi câu hỏi này** | trục đồng hồ **cạn** |
| 8–10 | trục dọc mở ra **như câu trả lời**: hoá ra mỗi dấu còn một toạ độ thứ hai | **hai trục** |

Trục thứ hai được **kiếm bằng một câu hỏi**, không được phát cho. Người xem biết trường trừu
tượng đang trả lời câu gì trước khi nó xuất hiện.

**Ràng buộc kéo theo:** trường phải **dùng được ngay lúc mở**, vì nó còn phải chở beat 12–38.
Không có ngân sách cho một đoạn "giải thích cách đọc biểu đồ". Nếu Step 3 thấy trường cần được
dạy, đó là bằng chứng chống lại chính trường — xem R2.

---

## 4. Thang biểu diễn

| nấc | biểu diễn | mức | beat |
|---|---|---|---|
| **R0** | trải nghiệm: một giá trị, và nó quay về cũ | — | 1–5 |
| **R1** | hai dấu trên **một** trục đồng hồ | L1 | 6–7 |
| **R2** | trục thứ hai mở; một node → mọi quan sát **trên đường của primary** | **L3** | 8–9 |
| **R3** | node thứ hai → một dấu **rời khỏi đường đó** | **L3** | 10–15 |
| **R4** | **đổi trục chiếu** → thứ tự đảo, dấu đứng yên | **L3 — aha chính** | 16–19 |
| **R5** | trường thành **không gian bảo đảm**: ba vị từ khác loại | L2→L3 | 20–24 |
| **R6** | trường thành **không gian quyết định**: bốn phép biến hình tích lại | **L3** | 25–33 |
| **R7** | trường thành **thứ đo được**: khoảng nào dụng cụ chạm tới | L2→L3 | 34–38 |
| **R0′** | về lại người xem — bằng hiểu biết đã đổi, không phải bằng reset | — | 39 |

---

## 5. Aha chính, và cơ cấu của nó

`story.aha`: *câu đọc xảy ra **sau** nếu đo bằng đồng hồ, **trước** nếu đo bằng vị trí log; với
một node hai cách đo là một, với hai node thì không.*

**Cơ cấu: tương quan bị phá, không phải hai thước đo vốn khác nhau.**

- **Một node** — mọi quan sát nằm **đúng trên đường của primary**. Đồng hồ tiến thì vị trí cũng
  tiến; không có cách nào tách. Chiếu lên trục nào cũng ra **cùng một thứ tự**. Đây là hình học
  của *"hai cách đo là một"*, và nó được **thấy**.
- **Node thứ hai** — replica có đường riêng. Câu đọc được phục vụ **trên đường của replica**,
  nên dấu của nó **rời khỏi đường primary**.
- Một dấu rời đường ⇒ **hai phép chiếu buộc phải bất đồng**. Đảo thứ tự là **hệ quả hình học**,
  không phải hiệu ứng được thêm vào.

R3→R4 vì thế là **phép quay hệ quy chiếu**: trục đang tác dụng đổi từ ngang sang dọc, **hai dấu
giữ nguyên toạ độ**, và thứ tự đọc được của chúng đảo. Đây là bài kiểm L3 chính.

---

## 6. R8 — ĐỘ LỆCH, không phải ĐỘ DỐC

Rủi ro sắc nhất trong đợt này: semantic lock A rò rỉ qua **hình học** chứ không qua chữ, nên
`never_say` không bắt được.

**Nếu đường replica có độ dốc thấp hơn, hình đang nói "replica chạy chậm hơn" — sai package.**

Package tự phủ định điều đó bằng dữ liệu của chính nó:

```
primary.log_position   [499, 499, 499, 500, 500, 500, 500, 500]
replica.log_position   [499, 499, 499, 499, 499, 499, 499, 500]
```

**Cùng một đường** `499 → 500`. Replica **tới sau**, không đi **chậm hơn**. Và `e1` phát biểu
quan hệ thẳng ra: *"replica luôn ở một vị trí **nhỏ hơn hoặc bằng** primary"* — một quan hệ về
**vị trí**, không về **tốc độ**.

**Luật dựng:** hai đường **song song theo cấu tạo**. Ở trạng thái ổn định replica áp đúng lượng
WAL mà primary sinh ra — nếu không thì độ trễ sẽ lớn dần vô hạn, và đó là một sự cố **khác** mà
package không nói tới. Độ lệch là **hằng số dịch chuyển**, và nó đọc được hai cách:

```
dịch NGANG  →  "replica tới vị trí đó muộn hơn"      (đồng hồ)
dịch DỌC    →  "ngay lúc này replica đang ở dưới"    (vị trí)
```

Chính cặp đọc đó là phép chiếu đôi, **nằm sẵn trong hình học của độ lệch**. Aha không cần thiết
bị riêng — nó là cách đọc thứ hai của một thứ đã có trên màn hình.

**Cách kiểm:** đo độ dốc hai đường trên artifact bằng hồi quy trên các mẫu pixel; đòi
`|slope_primary − slope_replica| < ε`. Một luật kiểm được, không phải một ý định được ghi chú.

---

## 7. HAI bảo đảm, HAI loại vị từ — và chính sự khác hình dạng là câu trả lời

Beat 21 chốt **"hai"**. Bảo đảm thứ ba (monotonic reads) ở nguyên `edge_cases[1]`, **không vào
narration, không được dựng, không được đặt tên bằng hình**.

> `rejected_explanations[2].reason` vẫn ghi *"Gộp **ba** bảo đảm khác nhau thành một"*. Đó là
> trường **KHÔNG-ĐƯỢC-DẠY**: nó mô tả **họ khái niệm mà cách giải thích sai gộp lại**, không
> phải số thực thể để dựng. Dựng hình **chỉ** từ `narration` + `semantic_model`.

Cấm gộp thành nhị phân "nhất quán / không nhất quán" — và lý do gọn hơn bản trước: hai bảo đảm
này **không cùng loại vị từ**, nên chúng thậm chí không có chung một thang để gộp.

| bảo đảm | vị từ về cái gì | hình dạng trong trường |
|---|---|---|
| eventual consistency | **trạng thái cuối** | đường dưới **cuối cùng chạm** mọi vị trí đường trên đã đạt — vẫn đúng, và **thấy được** |
| read-your-writes | **một cặp** (ghi của tôi, đọc của tôi) | dấu đọc **không được nằm dưới** dấu ghi của **cùng** quan sát viên — bị phá |

Hai hình dạng: **điểm cuối · một cặp**.

**Đây chính là câu trả lời cho hạng mục "EC còn đúng trong khi RYW mất".** Không cần bảo đảm thứ
ba, và cũng không cần một câu giải thích: một vị từ hỏi *"cuối cùng có tới không"*, vị từ kia hỏi
*"hai dấu này quan hệ thế nào"*. Một trường có thể **thoả cái thứ nhất và phá cái thứ hai cùng
lúc** vì chúng nói về hai thứ khác nhau — và trên màn hình điều đó **thấy được**: đường dưới vẫn
chạm 500 (EC đúng) trong khi dấu đọc vẫn nằm dưới dấu ghi (RYW bị phá).

Hai hình dạng **đủ, và sạch hơn ba**.

### Phần chịu được cả hai kết cục

**Hình học không phụ thuộc Beat 21.** Ba vị từ này là ba quan hệ có thật trong trường dù
narration có gọi tên mấy cái. Cái phụ thuộc Beat 21 **chỉ là việc gán nhãn**:

- **Nếu bảo đảm thứ ba được gọi tên trong lời** → hình dạng thứ ba nhận nhãn. Hình học không đổi
  một nét. Mục này **không phải viết lại**.
- **Nếu Beat 21 thành "hai bảo đảm"** → hình dạng thứ ba **không được sáng ở beat đó**; nó vẫn
  có thể tồn tại như một quan hệ trong trường nhưng không được đếm. Phải viết lại: **bảng trên
  (dòng thứ ba) và R4 trong risk register.**
- **Nếu Beat 21 giữ nguyên "ba" mà vẫn chỉ tên hai** → giữ nguyên R4 như đang khai: hiện **ba**
  hình dạng, chỉ **hai** mang nhãn, không bịa tên thứ ba.

**Không xin sửa narration phòng ngừa.** Đường escalate đúng: R1 trượt → thử biểu diễn trung
thực thứ hai → vẫn không chở nổi mà không phải bịa thẻ chữ → **chỉ khi đó** mới xin điểm tựa
bằng lời.

---

## 8. `stale` khác `lost` bằng hình, chịu được literalization

Giải bằng **sự có mặt của một vật**, không bằng nhãn:

- **Dấu commit ở `(t₁, 500)` nằm nguyên trên màn hình suốt đoạn sự cố.** Người xem **thấy nó**
  trong khi người dùng **không thấy nó**. Đó là toàn bộ `stale`.
- Cái người dùng thấy là **một dấu khác, ở chỗ khác** — không phải một **chỗ trống**.
- **`lost` sẽ trông thế nào:** dấu ở `500` **bị xoá**. Nó không bao giờ bị xoá.

Beat 4→5 (*"họ gọi đó là mất dữ liệu"* → *"không có gì mất"*) vì thế là **một chuyện xảy ra với
một vật**, không phải hai câu chữ: từ vựng sai được gán cho người báo lỗi, rồi bị bác bởi một
vật vẫn đang nằm đó.

**Luật kiểm được:** trong toàn bộ đoạn sự cố, **không dấu nào bị gỡ khỏi trường**. Đo trên
artifact: pixel của dấu commit phải có mặt liên tục từ lúc nó xuất hiện tới hết đoạn. Đếm được,
nên kiểm được — không phải một ý định.

---

## 9. R13 — khoảng trống, và vùng PHÍA TRÊN đường primary

Khai theo doctrine §6 cho **từng** vùng, không để vùng nào không có việc:

```
trên đường primary        =  BẤT KHẢ. Không quan sát nào sống được ở đây
dải giữa hai đường        =  CỬA SỔ. Không có dấu trong đó ≠ an toàn
dưới cả hai đường, trái   =  lịch sử cả hai node đã đi qua — mọi quan sát ở đó ĐỒNG THUẬN
bên phải dấu cuối         =  chưa xảy ra — chỗ cửa sổ hiện tại còn có thể bắt ai đó
```

### Vùng trên là BẤT KHẢ, không phải "tương lai"

Một điểm `(t, p)` với `p` lớn hơn vị trí primary tại `t` nghĩa là: **quan sát, tại thời điểm t,
một vị trí log mà primary chưa hề ghi ra.** Vị trí log do primary sinh ra; không gì đi trước nó
được. Package phát biểu thẳng quan hệ này ở `e1`: *"replica luôn ở một vị trí **nhỏ hơn hoặc
bằng** primary"*.

**Phạm vi của khẳng định:** đúng trong phạm vi `assumptions` của package — một primary,
streaming replication. **Không** viết thành luật chung cho mọi kiến trúc. (Bài học G01: không
mã hoá luật phổ quát vào tooling.)

### Hệ quả — và đây là chỗ khoảng trống làm việc thật

Nếu toàn bộ vùng trên là bất khả thì **mọi quan sát có thể tồn tại đều nằm trên hoặc dưới đường
primary**. Nghĩa là **"đứng sau" không phải một khuyết tật — nó là chỗ duy nhất mà bất cứ thứ gì
có thể đứng.** Đó chính là beat 7 (*"không node nào hỏng"*) được chở bằng **khoảng trống**, và
nó là thứ mạnh nhất mà negative space làm được trong video này.

**Còn nợ:** vùng dưới-trái hiện mới có nghĩa "đã đồng thuận". Nếu tới Step 4 nó vẫn chỉ là "chỗ
đã qua" thì bố cục chưa xong — đúng chỗ G01 trượt bên ngoài khung.

---

## 10. R10 — leo thang tỉ lệ (chỗ G01 trượt)

Ba vai (đọc → thao tác → đo) là leo thang **sức giải thích**, chưa phải leo thang **tỉ lệ**.
Tỉ lệ phải đổi vì **thứ người xem đang suy nghĩ đổi**, và ở đây **phạm vi của trường** là thứ
mang nghĩa nên nó đổi được một cách trung thực:

| beat | tỉ lệ | trường chứa gì | vì sao đổi |
|---|---|---|---|
| 1–5 | **người** | một giá trị trong giao diện | câu hỏi là của một người |
| 6–11 | **phiên** | vài giây, hai dấu, hai đường | câu hỏi thành "hai lần chạm này quan hệ thế nào" |
| 12–19 | **hệ** | cùng vài giây đó, nhưng **lịch sử dùng chung** chiếm khung | câu hỏi thành "chuyện gì xảy ra giữa hai node" |
| 20–24 | **không gian bảo đảm** | dấu cụ thể **thu lại**, nhường chỗ cho vị từ trên cả trường | không còn nói về sự cố này mà về **cái được hứa** |
| 25–33 | **không gian quyết định** | trường tích lại **bốn quỹ đạo** ở nơi trước đó có một | bốn vị trí phải **cùng tồn tại** để thành một không gian |
| 34–38 | **dụng cụ** | **vào gần dải** — chỉ còn khoảng cách và cái đo nó | câu hỏi thành "dụng cụ chạm tới được gì" |
| 39 | **người** | câu hỏi, cho người xem | về lại chỗ xuất phát, với hiểu biết đã đổi |

**Không đơn điệu tăng.** Nấc 34–38 đi **vào**, hẹp lại. Một cách hiểu "leo thang" thành "mở rộng
dần" sẽ dựng sai đoạn phát hiện — xem mục 14.

**Không camera hoá.** Các cú đổi tỉ lệ này là đổi **thứ trường chứa**, không phải đổi chỗ đứng
của máy quay. Camera vẫn phải tự chứng minh riêng (mục 12).

---

## 11. R3 + R11 — bốn vị trí

### Cơ cấu: bốn phép biến hình **khác loại**, TÍCH LẠI trên một trường

| | phép biến hình | mua | trả | không đổi |
|---|---|---|---|---|
| **V1** | dấu đọc **nhảy** lên đường primary — chỉ dấu đó | dấu đó trở lại chỗ đồng thuận | các dấu đọc khác vẫn ở đường dưới; **danh sách dấu nào cần nhảy nằm NGOÀI hệ thống** | chỗ đọc |
| **V2** | dấu đọc **trượt** sang phải tới khi đường dưới chạm 500 | *sau* thành thứ **so sánh được** — vị trí duy nhất chạm vào chính định nghĩa | dấu **phải chờ**; vị trí log phải đi xuyên các tầng | chỗ đọc |
| **V3** | **dấu commit** không kết thúc cho tới khi đường dưới chạm 500 — đầu mút của nó **được buộc vào đường dưới** | đường đồng thuận khôi phục cho **mọi** dấu, không cần biết dấu nào cần | commit trễ **nhiều hơn hẳn**; và xem dưới | lúc ghi kết thúc |
| **V4** | **không vẽ dấu đọc nào** — cái người dùng thấy lấy từ dấu commit | triệu chứng biến mất; rẻ, nhanh, và là cách phần lớn sản phẩm thật đang làm | **hình học không đổi một nét**; một dấu đọc khác (tab thứ hai) vẫn rơi xuống đường dưới | cái người dùng thấy |

Bốn phép **khác loại** — nhảy · trượt · buộc đầu mút · không vẽ — nên ngang hàng là hệ quả của
**hình học khác nhau**, không phải của **ô bằng nhau**.

**Tích lại, không xếp cạnh.** Mỗi phép chạy trên trường đầy khung rồi **để lại vệt**. Hết beat
33, trường mang **bốn quỹ đạo cùng lúc** ở nơi trước đó có một.
*(Bố cục bốn thể hiện nhỏ đặt cạnh nhau là **đường lùi**, và nó chính là rủi ro bốn-thẻ.)*

### §8 — chương dài nhất, ở MỘT tỉ lệ đứng yên: cái gì đổi?

Pushback (a) đã được duyệt, nên đoạn 25–33 là chương dài nhất của video mà **tỉ lệ không đổi** —
ngang hàng là yêu cầu ngữ nghĩa từ package, leo thang tỉ lệ chỉ là sở thích của doctrine. §8 vẫn
phải được thoả, nên khai thẳng thứ đổi:

> **Cái đổi là CẤU TRÚC và BIỂU DIỄN, không phải tỉ lệ.**
>
> - **Cấu trúc:** trường đi từ mang **một** quỹ đạo sang mang **bốn**. Số vật trong thế giới
>   đổi, và đổi theo cách tích luỹ — hết beat 33 người xem đang nhìn một thứ chưa từng tồn tại
>   ở beat 25.
> - **Biểu diễn:** trường đổi vai từ **thứ để đọc** (nó giải thích cơ chế) sang **thứ để thao
>   tác** (nó là cái bạn tác động vào). Cùng hình học, khác chức năng.
> - **Tiêu điểm:** mỗi phép biến hình chạm vào **một vật khác nhau** — V1/V2 chạm dấu đọc, V3
>   chạm dấu **commit**, V4 chạm **cái không được vẽ ra**. Tiêu điểm đi một vòng qua bốn chỗ
>   khác nhau của cùng một trường.

**Bốn phép khác LOẠI chính là cái đổi.** Không thêm chuyển động trang trí để lấp §8 — nếu đoạn
này thấy thiếu năng lượng, đó là bằng chứng chống lại kiến trúc, không phải lý do để thêm hiệu
ứng.

### R11 — chi phí availability của `remote_apply`

Chiến lược cũ chở latency mà **không** chở availability. Cặp không tách rời số 2 vì thế đang hở.

**Cách trung thực, cùng một thiết bị chở cả hai chi phí:** với `remote_apply`, đầu mút của dấu
commit **không neo vào một thời điểm** — nó neo vào một **điều kiện**: *khi đường dưới chạm 500*.
Vẽ đúng sợi neo đó, và:

- đường dưới đi chậm ⇒ đầu mút lùi ra xa ⇒ **độ trễ commit** — *much larger commit delays*;
- đường dưới **ngừng tiến** ⇒ đầu mút **không có chỗ nào để đáp** ⇒ **câu ghi không bao giờ kết
  thúc** — *replica chết thì đường ghi đứng theo*.

Một sự kiện hình học, hai chi phí, khớp đúng cặp beat 30–31. Không thêm thẻ chú thích.

**Rủi ro còn lại:** một dấu "dài ra không có điểm dừng" có thể đọc thành **"rất chậm"** thay vì
**"không bao giờ"**.

### Package có đỡ được một đường biên timeout / thất bại không? — **KHÔNG**

Đã soát toàn bộ snapshot `f6283785…` cho `timeout` · `thất bại` · `lỗi ghi` · `hết giờ` ·
`availability` · `fail`. **Không có một lần xuất hiện nào.** Package nói **đúng một câu** về
mặt này, và nói hai lần bằng cùng một từ:

> *"replica chết thì đường ghi **đứng** theo"* — `alternatives[1].cost` và `narration` beat 31.

Từ được chọn là **"đứng"**, không phải *"lỗi"*, không phải *"hết giờ"*, không phải *"thất bại"*.
Đó là một trạng thái **thứ ba**, không phải chậm và cũng không phải hỏng — và nó chính xác là
thứ mà một hệ chờ vô hạn đang ở.

**Hệ quả cho việc dựng:**

- **Không vẽ đường biên timeout.** Package không nói tới nó. Vẽ vào là bịa một mốc mà nguồn
  không có, và tệ hơn, nó **đổi khẳng định**: một câu ghi *đứng* và một câu ghi *thất bại* có
  hậu quả khác nhau đối với bên gọi. Đây đúng loại literalization mà E01→G01 đã học cách từ chối.
- Có thể trong hệ thật *"chờ vô hạn"* và *"thất bại qua timeout"* không tách rời được — quan sát
  đó hợp lý. Nhưng nó **nằm ngoài những gì package phát biểu**, và từ mà package chọn (*"đứng"*)
  **chủ động tránh** nó. Không suy diễn.
- Vì thế R11 **giữ nguyên đánh dấu "chưa đủ"**: câu hỏi *"một dấu dài ra không điểm dừng có đọc
  ra 'không bao giờ' thay vì 'rất chậm' không"* chỉ prototype mới trả lời được. Không vá bằng
  chữ, và cũng không vá bằng một đường biên mượn từ ngoài package.

---

## 12. Chiều sâu và camera

**Chiều sâu — chưa nhận.** Trường hai chiều đã chở *"hai quan sát viên trên một lịch sử"* bằng
hai đường trên một trục vị trí dùng chung. Trục thứ ba chưa thêm nghĩa nào. Ứng viên duy nhất
đáng thử là **nhiều replica** (`edge_cases[3]` — *"route ngẫu nhiên làm người dùng nhảy tới lui
giữa các phiên bản thế giới"*) và **nó không vào narration**. Ở lại 2D.

**Camera — một ứng viên, tiêu chí loại khai trước:**

> Camera ở R3→R4 chỉ được giữ nếu, đo trên artifact, **bản có camera cho người xem một quan hệ
> mà bản không camera không cho**. Nếu chỉ là cùng thông tin cộng thêm chuyển động — **loại**,
> ghi vào `rejected_devices` kèm số đo. Đúng cách cú vào gần CH1→CH2 của G01 bị loại.

Các nấc còn lại: mặc định **tĩnh**, và tĩnh phải có lý do chứ không được là mặc định câm.

---

## 13. Cái gì từ F01/G01 CỐ Ý không dùng lại

Gồm cả những thiết bị đã **thành công** — đó mới là chỗ thói quen nhà hình thành.

| thiết bị | ở đâu | vì sao không mang sang |
|---|---|---|
| **lưới ô + khung cấp phát** | G01, ngữ pháp trung tâm | chủ đề này **không có độ chiếm, không có phạm vi**. Lưới ở đây là phong cách nhà |
| **bất biến khẳng định bằng SỰ VẮNG MẶT của chuyển động** | G01, `distinctive_device` — thiết bị mạnh nhất của nó | khẳng định ở đây là về **thứ tự**, và thứ tự không hiện ra bằng sự đứng im. Với tay lấy nó vì nó từng hiệu quả là đúng định nghĩa thói quen |
| **khung đứng im trong khi ruột mang ba nghĩa** | G01 CH10, thiết bị cứu cả chương | **kề rất gần** giả thuyết R3 của tôi (một trường, bốn phép biến hình). Khác biệt: ở G01 **sự bất động chính là khẳng định**; ở đây trường bất biến chỉ là **sân**, còn khẳng định nằm ở **khác biệt giữa bốn phép**. Khai sự kề cận này ra thay vì giả vờ mới — nếu Step 3 thấy trường đang được giữ im **để trông giống G01**, loại nó |
| **thước hai thanh, khoảng cách = chủ đề** | G01 | đúng cảnh báo *"aha nào cũng thành thước"*. Cửa sổ ở đây là **một vùng của trường**, không phải cặp thanh dưới đáy |
| **dải quét vàng** | G01, 5 chương | không có tiến trình nào quét qua một không gian. `known_limitations` của G01 đã khai điều kiện tái dùng, và 007 không thoả |
| **hé lộ dân số theo thứ tự đọc** | G01 CH2, sửa được 4.25s chết | không có dân số |
| **ghost giữ chỗ khi vật đi vắng** | G01 CH3 | hấp dẫn cho *"giá trị vẫn còn trên primary"*, nhưng ở đây dấu commit **chỉ đơn giản ở nguyên đó**. Không có mượn-rồi-trả |
| **dải thanh ghi đếm sống/chết** | G01 | không có gì để đếm. Con số duy nhất có nguồn là *"thường dưới một giây"* |
| **bảng dấu hiện diện theo đường** | F01 | không có tập đường để đối chiếu |
| **hai vật chia chung một hình học** | F01, `spatial_model` | gần mà sai: ở đây hai đường **không** chia chung hình học, chúng chia chung **một trục** |

**Cái được mang sang là kỷ luật, không phải thiết bị:** đo trên artifact · bất biến khai được và
kiểm được · beat sync đo bằng chuyển động thật · liên tục đo ở ranh giới · chốt ngữ nghĩa trước
khi dựng · `never_say` · một giọng một video · một dụng cụ có thể tự nhiễu chính nó thì không
phải dụng cụ.

---

## 14. Chỗ tôi cho rằng doctrine V2.1, áp máy móc, sẽ làm 007 TỆ HƠN

Báo thẳng theo mục 7 của chỉ thị.

**a) Leo thang tỉ lệ phải NGỪNG bên trong đoạn bốn vị trí.**
Nếu bốn vị trí được cho bốn tỉ lệ khác nhau, chúng **thôi so sánh được** và biến thành bốn cảnh
xếp hạng ngầm — đúng thứ §9 cấm. Ở đoạn 25–33, **§9 (ngang hàng) thắng §7 (leo thang)**, và tỉ
lệ phải **giữ nguyên** suốt bốn phép. Leo thang của nấc này nằm ở **số quỹ đạo tích lại**, không
ở kích thước.

**b) "Leo thang" không được hiểu là mở rộng dần.**
Đoạn phát hiện (34–38) phải đi **vào**, không đi ra: câu hỏi thu về đúng một khoảng cách và cái
dụng cụ với tới nó. Một cách đọc doctrine kiểu "mỗi chương phải rộng hơn chương trước" sẽ dựng
sai đúng đoạn quan trọng nhất về mặt chẩn đoán.

**c) Trường hai trục là một canh bạc về ĐỘ PHỨC TẠP, và tôi không bảo vệ nó vì doctrine.**
Nó bắt người xem giữ **hai thứ tự** cùng lúc. Tiêu chuẩn review đặt `technical truth > semantic
clarity > architecture correctness > representation quality`, và **không thưởng cho độ phức
tạp**. Nếu R1/R2 cho thấy người xem không giữ nổi hai thứ tự, nước đi đúng là **lùi về biểu diễn
đơn giản hơn** (mục 15) — không phải cứu trường vì nó thoả V2.1 đẹp hơn.

**d) V4 đúng về ngữ nghĩa nhưng YẾU về kịch tính, và đó là kết quả đúng.**
"Không vẽ" là câu trả lời hình học chính xác cho *"đổi trải nghiệm chứ không đổi bảo đảm"* — và
vì thế nó là phép **im lặng nhất** trong bốn phép, trong một đoạn đòi bốn vị trí ngang hàng.
Làm nó **to lên** là nói dối. Nếu prototype cho thấy V4 chìm, câu trả lời đúng là **để nó chìm
và nói ra**, không phải thêm chuyển động cho cân. Ghi trước ở đây để sau này không ai "sửa" nó.

---

## 15. Đường lùi nếu R1 trượt

Bắt buộc khai. Nếu kiểm câm cho thấy phép đổi trục đọc ra như **hai biểu đồ khác nhau** chứ
không phải **một thế giới đổi hệ quy chiếu**:

### Lùi 1 — BAO HÀM thay cho phép chiếu *(biểu diễn trung thực thứ hai)*

Bỏ trục thứ hai. Lịch sử là **một đường duy nhất** `… 498 · 499 · 500`. Mỗi node là một **đoạn
bao** phủ phần tiền tố nó đã áp:

```
primary  [ ······················· 500 ]
replica  [ ··················· 499 ]        500 nằm NGOÀI
```

Câu đọc được phục vụ **bên trong đoạn bao của replica**, và `500` **không nằm trong đó**.
*"Sau"* thôi là chuyện thứ tự và thành chuyện **trong / ngoài một tiền tố**.

Vì sao vẫn trung thực và vẫn L3: thân phận giữ nguyên (dấu commit vẫn ở 500 trong cả hai biểu
diễn); thuộc tính đổi (thứ tự → bao hàm); và nó chở được `observation_order_matches_real_order`
**mà không cần thẻ chữ** — một quan sát chỉ thấy được thứ nằm trong tiền tố của nó. Nó cũng chở
`e1` (`replica ≤ primary`) thành **tiền tố lồng nhau**, đọc trực tiếp hơn cả hai đường.

Cái nó **mất**: chiều đồng hồ. Cặp không tách rời số 1 (hai khoảng chồng nhau) phải tìm chỗ khác
để sống — đó là chi phí đã biết của đường lùi này, không phải chuyện phát hiện sau.

### Lùi 2 — sàn

Hai khung tĩnh đặt cạnh nhau, cùng hai sự kiện, hai nhãn trục. Chỉ thị cấm mặc định, nên đây là
**sàn**, không phải lựa chọn. Nếu rơi tới đây, ghi lại như một kết quả R&D: hai biểu diễn hình
đã bị bác bằng đo, và đó là thông tin thật.

### Chỉ SAU Lùi 1 mới escalate

Nếu Lùi 1 cũng không chở nổi invariant mà không phải bịa thẻ chữ giải thích — **khi đó** mới xin
Content Agent một điểm tựa bằng lời. Không xin phòng ngừa.

---

## 16. Risk register R1–R13

| | rủi ro | cách kiểm |
|---|---|---|
| **R1** | Phép chiếu đọc ra *"hai biểu đồ"* thay vì *"cùng hai sự kiện, đảo thứ tự"* | **Kiểm câm**, không lời: người xem phải phát biểu được rằng hai dấu **không di chuyển**. Đo bổ trợ trên artifact: toạ độ pixel của hai dấu **không đổi** qua cú chuyển |
| **R2** | Đường primary không tự nói được *"một node thì hai cách đo là một"*, vẫn cần một câu | Dựng R2 **không chữ**; nếu phải thêm câu giải thích để hiểu được thì đường chéo là trang trí → cú tách đôi mất nền |
| **R3** | Bốn vị trí co lại thành bốn thẻ | Dựng bản **tích lại** và bản **bốn thể hiện**; kiểm câm xem bản nào cho ra *"bốn cách khác nhau"* thay vì *"bốn lựa chọn xếp hạng"*. Kiểm thêm: tỉ lệ có **giữ nguyên** suốt bốn phép không (mục 14a) |
| **R4** *(viết lại)* | **Hai vị từ đọc ra thành một thang nhị phân.** Rủi ro cũ ("ba hình dạng, hai nhãn") đã **chết theo Beat 21 = "hai"** — không còn hình dạng thứ ba để dựng. Nhưng rủi ro **ngược lại** vẫn sống và chính là thứ `rejected_explanations[2]` cấm: hai bảo đảm hiện ra như *"cái này bật, cái kia tắt"* trên cùng một thang | **Kiểm câm** ở beat 20–21: người xem phải phát biểu được **hai loại khẳng định khác nhau** (*"cuối cùng có tới không"* vs *"hai dấu này quan hệ thế nào"*), không phải *"một cái còn, một cái mất"*. Nếu họ mô tả bằng bật/tắt thì trượt — nhị phân đã hình thành dù không ai viết chữ nào |
| **R5** | Hai khoảng trên cùng trục đồng hồ không cho thấy được chỗ chồng nhau, hoặc chồng nhau mà không dẫn tới hệ quả trên trục vị trí | Prototype riêng cho beat 13–15. Kiểm câm: người xem phải chỉ ra được **vùng chồng**. Trượt = cặp không tách rời số 1 vỡ, beat 13 **dạy ngược** |
| **R6** | Ba loại lag thành ba thanh ngang nhau → *"ba chỉ số thay nhau, chọn cái tốt nhất"* | Dựng thành **ba mốc trên một hành trình**, và kiểm rằng chỉ mốc cuối **dời được dấu**. Kiểm ngược: che nhãn, người xem vẫn phải thấy hai mốc đầu **không chạm** vào vị trí phục vụ câu đọc |
| **R7** | Cửa sổ **trống** không đọc ra là **rủi ro** | Kiểm câm trên đoạn phát hiện: người xem phải nói được *"đo được bề rộng ≠ biết có ai trong đó"* |
| **R8** | **Độ dốc thay vì độ lệch** → hình dạy "replica chậm" (lock A rò qua hình học, `never_say` không bắt) | Đo hồi quy độ dốc hai đường trên artifact; đòi `|slope_p − slope_r| < ε`. Kiểm ngược: dựng cố ý một bản dốc lệch và xác nhận bộ kiểm **nổ** |
| **R9** | Mở màn bằng trường trừu tượng chưa ai hỏi tới | Kiểm thứ tự: trục thứ hai chỉ được xuất hiện **sau** khi trục đồng hồ đã tỏ ra không trả lời nổi câu hỏi. Kiểm câm ở beat 8: người xem phải nói được trường **đang trả lời câu gì** |
| **R10** | Cả video ở đúng một tỉ lệ vì trường tồn tại xuyên suốt | Đo **phạm vi trường** (khoảng đồng hồ và khoảng vị trí đang hiển thị) ở từng nấc; đòi nó **đổi** ở các ranh giới đã khai ở mục 10 — và đòi nó **không đổi** bên trong đoạn 25–33 |
| **R11** | `remote_apply` render thành "dời điểm cuối xa hơn", mất hệ quả availability | Prototype sợi neo. Kiểm câm hai kịch bản: đường dưới **chậm** vs đường dưới **ngừng**. Người xem phải phân biệt được *"rất chậm"* với *"không bao giờ"*. Không phân biệt được → đánh dấu **chưa đủ**, không vá bằng chữ |
| **R12** | `replay_lag ≈ 0` thành đồng hồ đo mức bảo đảm | Dựng **hai** tình huống cho **cùng một số đọc**: (a) hai đường cùng tiến, lệch nhỏ; (b) hai đường **cùng phẳng** vì primary rảnh. Đòi số đọc **giống hệt nhau** trong khi trường **khác hẳn**. Đó là *signal ≠ diagnosis*, đo được |
| **R14** | **Sự vắng mặt ở V4 nhập nhằng.** *"Không vẽ"* đúng về nghĩa (không câu đọc nào chạm replica ⇒ trường không đổi ⇒ bảo đảm không đổi), nhưng có thể đọc thành *"không có vấn đề gì"* thay vì *"vấn đề còn nguyên, chỉ không ai nhìn"*. Đây đúng cặp không tách rời số 3 | **Kiểm câm bằng DỰ ĐOÁN, không bằng nhãn.** Sau khi V4 chạy, đưa vào trường **một câu đọc thứ hai** — package tự cho sẵn: *"Tab thứ hai, thiết bị thứ hai, hay bất kỳ đường đọc nào khác vẫn thấy giá trị cũ"*. Hỏi người xem **trước khi nó rơi**: dấu này sẽ đáp ở đâu? Trả lời *"dưới dấu ghi, y như cũ"* ⇒ sự vắng mặt đọc đúng. Trả lời *"trên đường primary / đã sửa rồi"* ⇒ **R14 trượt**. Không dùng nhãn *"dữ liệu vẫn cũ"* — bằng chứng phải là **một dấu rơi**, và beat 32–33 vì thế thành **hai sự kiện trên một trường** chứ không phải một câu chữ đính kèm |
| **R13** | Vùng lớn trong trường không có nghĩa | Vùng trên đường primary = **bất khả** (mục 9), trong phạm vi `assumptions`. Kiểm: **không dấu nào** được vẽ ở đó, bao giờ. Vùng dưới-trái vẫn **còn nợ** nghĩa — phải giải trước khi khoá Step 4 |

---

## 17. Semantic replay — NON-AUTHORITATIVE cho package này

Chốt chính sách, chi tiết ở `SEMANTIC_ANALYSIS.md` mục 14:

- Replay được đánh dấu **NON-AUTHORITATIVE** cho Package 007.
- **`0/7 invariant bị phá` KHÔNG phải bằng chứng cơ chế đã được mô hình hoá an toàn.** Nó là
  bằng chứng **ngược lại**: dụng cụ không với tới được.
- Bốn khoảng thiếu là **nợ tooling generalizable của Video Engine**, không phải khuyết tật của
  Content Package.
- **Không mở rộng replay trong lượt này.** Chỉ mở nếu Step 3 chứng minh là cần.

---

## 18. Giả thuyết biến đổi V2.1 — phát biểu để đem đi bác

> Trường **(đồng hồ × vị trí trên lịch sử)** là một thế giới bền duy nhất chở được cả video.
> Nó **được sinh ra từ** một câu hỏi mà trục đồng hồ không trả lời nổi. Với một node, mọi quan
> sát nằm trên đường primary, nên hai phép chiếu trùng nhau — *sau* là một khái niệm xác định.
> Node thứ hai phá tương quan đó bằng một **độ lệch song song** (không phải độ dốc); một dấu rời
> đường, và **hai phép chiếu buộc phải bất đồng**. Từ đó mọi thứ còn lại là **cùng trường đó
> dưới bốn vai**: thứ để đọc · thứ để hứa · thứ để thao tác · thứ để đo. Vùng phía trên đường
> primary là **bất khả**, nên "đứng sau" không phải khuyết tật mà là chỗ duy nhất mọi thứ có thể
> đứng — và đó là beat *"không node nào hỏng"*, chở bằng khoảng trống.

Bác được bằng **R1**. Nếu trượt → **Lùi 1: bao hàm tiền tố** (mục 15).
