# F01 — Step 3: Visual R&D findings

Prototype: `shots/p1-authoring` · `shots/p2-aha` · `shots/p4-limits` — cả ba `status: experiment`,
`stage: r_and_d`. Không phải shot của video.

Cơ chế được chứng minh **trước khi vẽ**: `cv sem F01-object-level-authz` → hai scenario
(`broken`, `fixed`) replay khớp claims. `authorized_access` key theo (subject, **resource**), nên
nếu mô hình hoá check của middleware trên `document` thì anti-fabrication gate bắt ngay — engine
ép đúng ranh giới authentication / object-level authorization.

---

## Hai mâu thuẫn ngữ nghĩa phát hiện trong pass này (đều là lỗi của Step 2)

**1. "Câu trả lời phân quyền có phạm vi = một lần truy cập, không nới ra cho đường khác."** Sai.
Một quyết định về (subject, resource, action) áp được cho **bất kỳ** đường nào — chính vì thế
enforcement tập trung mới hoạt động. Package viết *"phải được HỎI LẠI ở mỗi đường"*: đó là về
**hành vi hỏi**, không về hạn dùng của câu trả lời. Đã sửa `VISUAL_STRATEGY.md` §6 lần hai.

Đây là lỗi nghiêm trọng vì nó *đã sinh ra một direction* cho aha, và direction đó dựng lên sẽ dạy
rằng authorization là thuộc tính của một route.

**2. "Object authorization phải được đặt một lần cho mỗi đường."** Đã bị khoá ở lock trước; ghi
thêm vào `semantics.yaml` `never_say` để nó không quay lại qua đường Step 4. Luật chung: *mọi truy
cập tới object được bảo vệ phải chịu quyết định phân quyền cần thiết*. "Thủ công trong từng
handler" là `assumptions` của kịch bản.

---

## Cơ chế được chọn

### H1 — Register tác giả: hai thân handler hoàn chỉnh (`p1-authoring`)

Đo được, không phải phán: mono advance 0.6em → ở **38px** một dòng chứa 894/22.8 = 39 ký tự. Dòng
dài nhất 37. Code **thật, hoàn chỉnh, không viết tắt kiểu đố chữ**.

**Phát hiện mạnh nhất của Step 3:** `req.principal` so với `req.params.id`. Hai thân với vào
**cùng một object `req`**; thân A với tới `req.principal` **và** `req.params.id`, thân B chỉ với
tới `req.params.id`. Bất đối xứng là **field nào của một object được với tới**.

Điều này giải quyết ba yêu cầu bằng một hình:

- **principal có mặt mà không được hỏi tới, không cần mũi tên.** Đã kiểm bằng cách **xoá nhãn giải
  thích** và render lại: vẫn đọc được. Theo đúng luật §5.4 của Step 2 ("cần nhãn là đã thất bại"),
  nhãn bị cắt vì **dư**, không vì sai.
- **Chặn banned explanation (2) "thiếu authentication"**: authentication rõ ràng đã chạy, principal
  nằm đó.
- **Không dùng biến local chưa dùng.** Một local chưa dùng là thứ linter sẽ báo, tức là *trông
  sai* — phá luật §5.2 (thân B phải trông hoàn chỉnh và đã qua review).

**Đã xoá toàn bộ tầng annotation.** Ban đầu có một bar ochre ở lề và nhãn `QUYẾT ĐỊNH` inline. Ở
38px nhãn đè vào `doc)`, đọc thành một token — và hoá ra cả hai đều dư: **màu** của token
`assertMember` cộng với dòng đếm cùng màu ở dưới đã gắn nghĩa cho màu đó. Bar ở lề còn mang đúng
rủi ro của placeholder: nó vắng mặt cạnh thân B, và "thiếu marker" là một bước tới "thiếu bước".

### H2 — Aha: ĐƯỢC GIAO so với PHẢI ĐƯỢC THỰC HIỆN (`p2-aha`)

Bốn route HTTP tới cùng tài liệu. Lượt một: `req.principal` xuất hiện trên **cả bốn**, stagger
nhanh — không ai làm gì để nó ở đó. Lượt hai, **cùng một cột**: chỉ một `assertMember(doc)`.

Bốn-so-một đọc được **vì vị trí đồng nhất**, không cần marker. Không có placeholder nào cạnh ba
đường không thực hiện nó.

Đóng bằng một claim, không phải một mô tả: *một danh từ bạn nhận được / một động từ bạn phải làm*.
Và nó làm fix đọc được ngay — fix biến quyết định phân quyền từ **động từ phải làm** thành **thứ
được giao tới**, tức là `thừa hưởng`, đúng cơ chế package nêu.

**Cả bốn dòng đều là route HTTP, có chủ đích.** Một job nền hay một GraphQL resolver **không** có
`req.principal`; đưa chúng vào danh sách này để hình mạnh hơn sẽ là một lời nói dối. Chúng thuộc
register giới hạn.

---

## Bị loại

### Loại bằng ngữ nghĩa, không dựng — hai direction cho aha

| Direction | Vì sao loại |
|---|---|
| **Phạm vi câu trả lời hết ở một lần truy cập** | Sai (xem mâu thuẫn 1). Một quyết định (subject, resource) áp cho mọi đường. Dựng lên sẽ dạy rằng enforcement tập trung không thể hoạt động — trong khi package liệt kê nó trong `alternatives`. |
| **Câu trả lời không tái dùng được vì nó nêu tên code path** | Sai và tệ hơn: nó dạy authorization là thuộc tính của một *route*. Một quyết định phân quyền không nói gì về đường code. |

Hai direction này không được prototype vì chúng sai ở tầng ngữ nghĩa, không ở tầng thị giác. Dựng
rồi mới loại là tốn công vô ích — và tệ hơn, một hình đẹp dễ khiến người ta bỏ qua việc nó nói sai.

### Loại một nửa — `p4-limits`

**Nửa giữ được:** ý tưởng "bản kê dài hơn cái fix". Bốn lời dè dặt của register 32s (lối đặc
quyền, chỉ phủ quan hệ sở hữu, bài test, ranh giới test không chứng minh gì) thôi là bốn caveat
rời và thành **một hình**: bản kê người xem đã theo dõi hai phút tiếp tục dài ra, và dài quá tầm
với của bất kỳ một cơ chế nào. Bốn lý do **không vần với nhau** chính là nội dung — không có một
chu vi nào chứa được cả bốn. Không có placeholder; hàng nào không được phủ thì cột đó **trống**, và
lý do được viết ra vì lý do mỗi hàng một khác, không suy ra được từ một sự vắng mặt.

**Nửa bị loại — và đây là phát hiện đáng giá nhất của pass này:** gộp **trade-off** và
**detection** vào cùng một bản kê tạo ra một phương trình sai. Khung vừa cho thấy 4 đường được fix
phủ và 4 đường không, rồi dòng đếm nói `4 trên 8 đường có test đó`. Cùng mẫu số 4/8 → người xem
hợp nhất *được fix phủ* với *có test*. Hai thứ khác nhau: độ phủ test đếm trên **route nhận object
id từ client**, còn tầm với của fix là chuyện khác hẳn. Cả package lẫn thực tế đều không đỡ phương
trình đó.

→ **Step 4: trade-off và detection phải là hai register riêng.** Chúng đếm hai thứ khác nhau trên
hai population khác nhau, và dán chung một danh sách là chế ra một quan hệ không tồn tại.

**Lỗi thứ hai của p4:** cụm `quyết định được giao tới` lặp bốn lần trong mono ochre. Mono trong
ngữ pháp của thư viện này là **giá trị**, không phải nhãn — nên bốn lần lặp một nhãn dài trong mono
vừa là typography-thành-nhãn (regression đã ghi ở E01), vừa lấn hết khung và làm những hàng *đáng
quan tâm* (hàng không được phủ) trở thành thứ yếu.

---

## Phát hiện về khung, không phải lỗi cần sửa

**Register đọc vốn dĩ chiếm ~50% khung là không khí.** P1 dùng 240..1100 của 1920; P2 còn ít hơn.
Tôi đã kiểm phương án ngược: ở 48px một dòng chỉ chứa 31 ký tự, buộc code thành `d = docs.get(...)`
— tức là mất luật §5.2 (thân hàm phải trông hoàn chỉnh và đã qua review).

Đây là **đánh đổi giữa cỡ chữ và tính thật của code**, và tính thật thắng, vì toàn bộ luật
"chưa-từng-có-ở-đó" dựa vào việc thân B trông xong việc.

→ Hệ quả cho Step 4: register này phải được **nhịp dài** (Step 2 đã định 18–20s) và **không được
kiêm luôn một punchline**. Đừng rescale nó; đừng bắt nó gánh thêm.

## Đa dạng — cảnh báo cho Step 4

`cv variety`: p1↔p2 = 0.57 · p1↔p4 = 0.35 · p2↔p4 = 0.35. Không cặp nào bị flag (ngưỡng ~0.05).

Nhưng **0.35 là cặp sát nhất trong thư viện tới giờ** (bằng cặp shot_02↔shot_09 của E01), và đây
chỉ mới ba prototype **cùng một register**. Nếu video đủ có 5–6 shot trong register đọc, vài cặp sẽ
rơi xuống ~0.30. `cv variety` **sẽ không báo**, nhưng người xem sẽ cảm thấy.

→ Step 4 phải phân biệt bằng **phép toán trên vật liệu**, không bằng nội dung chữ: so sánh (H1) ·
đếm (H2) · di dời (fix) · liệt kê giới hạn (trade-off) · đếm độ phủ (detection). Nếu hai register
cùng một phép toán, một trong hai phải bị bỏ. Metric không policing được việc này — tôi phải làm.

## Rủi ro còn mở, chuyển sang Step 4

1. **H2 có thể đọc thành "thay thế".** Lượt một mờ đi trong khi lượt hai hiện lên ở cùng cột —
   người xem có thể đọc là `req.principal` **biến thành** `assertMember`, thay vì hai sự thật rời
   về cùng bốn đường. Contact sheet tĩnh **không trả lời được** câu này; nó là câu hỏi về chuyển
   động. Mitigation đã kiểm bằng số học: giữ **cả hai cột cùng lúc** ở cuối, với route rút gọn
   (`/docs/:id/comments` 18 ký tự → 367px), cột 1 ở x=500, cột 2 ở x=800 cho `assertMember`
   (245px) → hết ở 1045, vừa khung. Cần một vòng prototype nữa ở Step 4.
2. **Register detection chưa có hình.** Nó vừa bị tách khỏi trade-off, nên nó đang không có ý
   tưởng nào — giống đúng chỗ mà Step 2 đã ghi là rủi ro số 4.
3. **Fix (di dời) chưa được prototype.** Đây là thay đổi không gian duy nhất của video và là chỗ
   duy nhất camera làm việc lớn. Chưa có bằng chứng nào cho nó.

**Step 3 hoàn thành. Chưa dựng video 170s.**

---

## Step 5 — những gì phải sửa vì đo, không vì nghĩ

### s08: một phép co được KHAI, không được THỰC HIỆN

Bản đầu của `s08-not-id` đặt `width: 894px / 700px / 620px` lên ba khối chữ rồi ghi trong
comment rằng "phạm vi khẳng định co lại quanh một object đứng yên". Chữ không bao giờ lấp
đầy container, nên trên màn hình **không có gì co lại cả**. `cv gate` báo sạch, vì không
checker nào đọc được ý định.

Đây đúng là loại lỗi đã gặp ở match cut 03→04: khẳng định một thao tác không gian thay vì
thực hiện nó. Lần đó phải đo YMAX mới lộ ra; lần này phải liệt kê cơ chế tween của cả 5 shot
narrowing mới lộ ra — s08 là shot duy nhất chỉ có "hiện/ẩn" và chỉ có một cột x.

Bản sau biến phạm vi thành một dải đo được, chia làm ba ô là ba thứ người ta tin rằng "đổi id
sang thứ khó đoán" kiểm soát được. Hai ô `scaleX` về 0 — dải **thật sự** còn một phần ba —
và nhãn của chúng ở lại, tắt đèn, đánh dấu phần đất khẳng định không còn phủ. UUID không hề
bị tween nào chạm tới.

Không phải progress bar: không số, không phần trăm, không vạch chia, và nó chỉ đi theo một
chiều là nhỏ lại.

### Năm phép co, năm cơ chế

| shot | tập bị thu hẹp | cơ chế trên màn hình |
|---|---|---|
| `s02-eliminate` | các cách giải thích cạnh tranh | gạch bỏ tại chỗ → cả vùng sập → người sống sót chiếm chỗ trống |
| `s08-not-id` | phạm vi một khẳng định về object có thật | dải đo được co còn 1/3, object đứng yên tuyệt đối |
| `s09-not-a-line` | một hành động được đề xuất | cắt bỏ — và lỗ hổng ở lại, lý do hiện ở vị trí KHÁC |
| `s13-scope-limits` | tầm áp dụng của cách sửa | khối lượng di cư xuống dưới, không gạch gì cả |
| `s14-limits` | thứ một tín hiệu chứng minh được | khẳng định đứng yên và mất dần sắc độ |

### Browser bị chính sách máy chặn

Render hỏng toàn bộ với `spawn UNKNOWN`. Không phải shim `no-console-window`, không phải
ffmpeg: **WDAC (Windows Application Control) chặn thi hành** bản `chrome-headless-shell
152.0.7977.30` trong cache HyperFrames. Tầng render chỉ nói "spawn UNKNOWN"; phải chạy tay
binary đó mới thấy câu "An Application Control policy has blocked this file".

Bản 131 trong cache puppeteer — vốn là bản `cv gate` vẫn dùng — được phép chạy. Đặt
`HYPERFRAMES_BROWSER_PATH` về nó trong `.env.local` (không commit). Hệ quả phụ có lợi: từ nay
gate và render đo trên cùng một engine, thay vì gate 131 / render 152 như trước.

### Ba chỗ Visual Engine đã vượt quá Content Package — và đã trả lại

Bắt được khi đối chiếu từng khung chữ với **nguyên văn narration** trong content-package,
không phải khi nhìn khung hình.

1. **`s14-signal` bỏ mất con số.** Lời thoại kết đoạn bằng "rồi đếm xem bao nhiêu phần trăm
   route đã có test đó". Tôi đã bỏ hẳn dấu %, lập luận rằng phần trăm mời gọi cách đọc
   "tám mươi hai phần trăm là ổn". Lập luận đó đúng — nhưng **package tự phòng chuyện đó
   bằng chính đoạn kế tiếp**: `s14-limits` tồn tại để nói con số ấy chứng minh và không
   chứng minh cái gì. Bỏ con số là Visual Engine quyết thay Content Engine ở đúng chỗ
   Content Engine đã lo. Con số đã trả lại, hiện bằng ink như một phép đo — không thanh,
   không đồng hồ, không màu phán xét.

2. **`s13` tự thêm phạm vi.** Lời thoại nói cách sửa "chỉ phủ quan hệ sở hữu"; khung hình
   ghi "quan hệ sở hữu · quan hệ thành viên". Vế thứ hai là tôi thêm. Đã cắt. Câu kết
   "bất biến không đổi — chỉ là quyết định phức tạp hơn" cũng là bình luận biên tập không có
   trong package; đã cắt.

3. **`s12` thêm một loại thứ ba.** Lời thoại nêu đúng hai loại — job nền và công cụ admin.
   Khung hình có `migration: backfill`, là loại thứ ba. Đã đổi thành một job nền nữa.

Cùng lượt rà đó bắt thêm:

- **`s10` thiếu một điều kiện thật**: "Trừ tài nguyên công khai" bị bỏ mất, khiến "mặc định
  là từ chối" mạnh hơn mức package nói. Đã bổ sung.
- **`s02-eliminate` mâu thuẫn với chính nó**: nhãn ghi "một dữ kiện" trong khi khung bày ba
  dữ kiện. Số lượng dữ kiện trong lời thoại là chỗ mơ hồ, và hình không có quyền phân xử —
  nhãn nay chỉ nói phần không mơ hồ.
- **`s02` sai dữ kiện nào giết giả thuyết nào**: thứ bác bỏ "xác thực hỏng" không phải token
  cũ hết hạn mà là *người này đang đăng nhập bằng tài khoản hiện tại*. Câu đó đang thiếu
  hẳn. Đã thêm, và mỗi giả thuyết nay đứng NGAY TRÊN dữ kiện giết nó.
- **`s07` dùng ochre sai nghĩa**: trong video này ochre nghĩa là "ở đây có quyết định phân
  quyền" (s04, s06, s11, s12). Tô ochre cho tên hạng mục OWASP là lặng lẽ biến bảng màu
  thành nhấn mạnh chung chung. Đã đổi về ink.
- **`s06` viết tên hàm vào một bảng trừu tượng**: `req.principal` và `assertMember` là code
  thật và thuộc về s03/s04, nơi chúng được viết ra. Mang vào bảng năm đường, chúng thôi
  nghĩa là "đường này chịu một quyết định" và thành "đường này gọi hàm đó" — đúng never_say
  số 5 — đồng thời đặt hai token của H2 cạnh nhau, cho không cách đọc thay-thế. Hai cột nay
  là **dấu hiện diện**, và tiêu đề cột gánh toàn bộ nghĩa.

### Một hồi quy do chính việc dựng lại gây ra

`s11` mở trên **khung đóng của `s10`** — đó là match cut đã thiết kế, cùng ngữ pháp với
03→04. Dựng lại `s10` với bố cục nặng-giữa (theo Composition Architecture) đã làm gãy cú cắt
đó: `s11` sẽ mở bằng một khối xuất hiện từ hư không rồi biến mất sau 1.4s.

`s11` nằm trong ba shot phải giữ nguyên bố cục, nên `s10` là bên khớp lại. Hình học của
`s10` nay là hình học của `s11`, tới từng pixel. Cái mất: `s10` không còn là khung nặng-giữa
phá thói quen nặng-trên. Cái được: cú cắt đúng. `s07` (tên chiếm giữa khung) và `s15`
(nặng dưới) vẫn gánh phần đa dạng đó.

Điều này chỉ lộ ra khi đọc comment của `s11` — không checker nào biết hai shot phải chung
một khung.

### Một assertion sai tiền đề, lộ ra nhờ retiming

Sau khi retime `s04-authored-b` theo nhịp thoại thật (15s → 21.5s), `keepsMoving` báo
"không có gì động từ 5.54s tới 13.3s". Đo trực tiếp bằng `tblend=difference` thì **pixel có
đổi ở 6.47s, 8.33s và 11.87s**, YMAX tới 52 — đúng ba lần đổi màu đặt tên cho từng reach.

`keepsMoving` chỉ đo hình học và opacity. Chuyển động của shot này **là màu**, và hai thân
handler bắt buộc phải đứng yên từng pixel vì `s03→s04` là match cut. Tiền đề của assertion
sai với shot này, nên assertion bị gỡ và lý do được ghi thẳng vào `validation` để lần sau
không ai "sửa" bằng cách thêm chuyển động.

Không nới `max_static_sec` lên một con số vừa đủ qua — đó là chỉnh phép đo cho vừa kết quả.
