# G01 — nhật ký sản xuất

Ghi trong lúc dựng. Mọi phát hiện dưới đây đến từ **đo**, không từ đọc lại code — và cả hai
lỗi lớn đều **trông đúng** khi xem từng chương riêng lẻ.

---

## Tiếng nói

Profile `namtre_v2` dựng lại trên runtime hiện tại từ công thức bền → id `a666ed5a`.
`ref_text` server trả về khớp `giong/manifest.json` **từng byte**; `instruct` khớp.

38/38 segment sinh ở `speed 1.00, seed 1, vi`, mỗi segment xác minh qua `/history`. Không
dropped chunk, không segment nào thiếu `audio_id`, không duration ≤ 0.

| | đo được | package giả định |
|---|---|---|
| âm tiết | 658 | 658 |
| nhịp | **4.20 âm/s** | 4.19 âm/s |
| thời lượng | **156.69s** | 157s |

Không hiệu chỉnh tốc độ. Bằng chứng nói thế, không phải khẩu vị.

---

## Cấu trúc: liên tục là thứ được DỰNG, không phải thứ được hứa

Mô phỏng thế giới chạy một lần ở Node. Mỗi chương được sinh ra với **đúng trạng thái đóng của
chương trước**. Một chương không thể trôi khỏi chương trước vì nó không bao giờ tự tính điểm
xuất phát của mình.

Điều đó biến "thế giới có bền không" thành một câu **đo được**: so khung cuối chương này với
khung đầu chương kế. Ranh giới khai LIÊN TỤC phải cho YAVG thấp; khai CẮT phải cho cao.

---

## Bug 1 — thao tác chỉ tồn tại trong animation

Bản vá đồng bộ beat thêm vào CH7 một sweep tay ở beat 1 và **năm cặp update+sweep** ở beat 5.
Tôi thêm chúng vào *animation* và quên thêm vào *mô phỏng*.

Hệ quả: `START.CH8`, `START.CH9`, `START.CH10`, `START.CH11` đều là snapshot của một thế giới
**chưa từng tồn tại**. Ba ranh giới khai LIÊN TỤC đo ra:

```
ch06 → ch07    7.71
ch07 → ch08   14.72
ch08 → ch09   11.08
```

Xem CH7 riêng: đúng. Xem CH8 riêng: đúng. Chỉ phép đo giữa hai chương mới thấy.

**Luật rút ra:** mọi thao tác một chương ANIMATE đều phải có trong mô phỏng, cùng thứ tự. Mô
phỏng là thứ duy nhất chương sau thừa hưởng.

---

## Bug 2 — đọc trạng thái lúc dựng, trong khi trạng thái chỉ đổi lúc phát

`firstFree()` quét `cells[i].state` để tìm ô trống tái dùng. Nhưng `cells[].state` chỉ đổi khi
timeline **phát** (qua `tl.call`), còn `firstFree()` được gọi khi timeline đang **được dựng**.

Nên tám update của CH6 đều nhắm vào **cùng một ô**. Chương kết thúc ở một trạng thái mà chương
sau chưa từng thừa hưởng — và ranh giới `ch06 → ch07` đo ra 7.71.

Bug này đặc biệt xấu vì nó **im lặng và đúng ngữ pháp**: không lỗi, không cảnh báo, và một
chương xem riêng vẫn hợp lý.

**Sửa:** một bản trạng thái song song (`st`) cập nhật đồng bộ ngay lúc dựng, và `sweep(reclaim)`
cũng phải cập nhật nó. Đây chính là cùng một họ lỗi với `oldEls` ở P4 — *danh sách hoặc trạng
thái chụp lúc dựng không bao giờ đúng với một thế giới sinh ra lúc chạy*.

---

## Đồng bộ beat — bộ kiểm phải hỏi artifact

Bản đầu quét số trong source và báo **16/38 beat lệch**. Sai: tween lên lịch trong vòng lặp
hoặc trong `sweep()` mang thời điểm tính toán, nên đọc file không thấy gì.

`tools/check-beat-sync.mjs` lấy mẫu 4fps, tính chênh lệch khung-liền-khung, và đòi mỗi cửa sổ
beat phải chứa ít nhất một khung có đổi. Đo trên artifact thì còn **5/38** — và cả năm là thật:

| beat | thiếu gì | sự kiện đã thêm |
|---|---|---|
| CH3 b1 | "autovacuum tồn tại nhưng không chạy liên tục" | dải sweep **hiện ra ở mép trên và đứng yên** — một cỗ máy có mặt mà không chạy |
| CH4 b4 | "file không nhỏ đi một byte" | kéo dài đuôi sweep vào đúng beat: ô cuối thành trống trong khi khung không nhúc nhích |
| CH7 b1 | "cách sửa KHÔNG phải chạy VACUUM tay" | một sweep tay chạy — và biên không dịch. Đó chính là lý do |
| CH7 b5 | "đổi lấy: autovacuum chạy thường hơn, tốn I/O đều hơn" | sweep dồn dập, mật độ **là** cái giá |
| CH8 b1 | "còn một trường hợp riêng phải biết" | đường chân trời **đến** ngay trên câu đó |

Ở cả năm, sự kiện đúng chính là **nghĩa của beat**. Không beat nào được lấp bằng chuyển động
trang trí.

---

## Bất biến VACUUM

Bốn cửa sổ khai, tất cả đo trên artifact:

```
ch04-cu-lat          1.9s → 12.7s   biên [416..1293] × [76..1039] không đổi
ch07-cach-sua        0.5s →  2.6s   không đổi
ch08-vacuum-vo-ich     7s →  9.5s   không đổi
p2-threshold…          9s → 11.6s   không đổi
```

Phép đo từng bắt cả **viền khử răng cưa của chữ** phía trên thế giới (đỉnh hộp báo 251 trong
khi khung ở 416). Vẫn cho kết quả đúng ở đây, nhưng đó là đo rộng hơn ý định và sẽ che một cú
dịch thật nếu chữ giữ hộp cố định. Đã thu vùng quét về `y ≥ 400`.

---

## Bug 3 — thứ tự của một mảng cũng là trạng thái

Sau khi sửa Bug 1 và Bug 2, bốn ranh giới vẫn đo ra khác hẳn — chỉ nhẹ hơn (7.71 → 4.20).

Hàm chọn ô là `live[(u * 37 + 13) % live.length]`, nên nó **index vào mảng `live`**. Mô phỏng
giữ mảng đó theo lịch sử thay-thế-tại-chỗ (`live[indexOf(pick)] = target`), còn mỗi chương
**dựng lại nó bằng cách quét INIT theo thứ tự chỉ số**.

Cùng tập phần tử, khác thứ tự — nên cùng một `u` cho ra ô khác nhau, và chương trôi khỏi
snapshot mà chương sau thừa hưởng.

Đây là loại lỗi khó thấy nhất trong ba cái: `INIT` đúng, `u` đúng, `nextFree` đúng, `alloc`
đúng. Chỉ **thứ tự** sai, và thứ tự không xuất hiện ở bất kỳ giá trị nào người ta nghĩ tới khi
kiểm tra trạng thái.

**Sửa:** `snap()` mang theo `live.slice()`, và mỗi chương nhận nguyên mảng đó thay vì tự dựng.

**Luật rút ra:** nếu một hàm index vào một mảng thì thứ tự của mảng đó **là trạng thái**, và
phải được truyền đi như mọi trạng thái khác.

---

## Bug 4 — hai tiến trình đo dùng chung một tên file tạm

Bộ đo liên tục ghi `A.png` / `B.png` vào một đường dẫn scratchpad **cố định**. Hai bản của nó
chạy cùng lúc, ghi đè khung của nhau, và cho ra **hai bảng vừa khác nhau vừa khác artifact**:

| ranh giới | bảng A | bảng B | đo lại sạch |
|---|---|---|---|
| ch01 → ch02 (CẮT) | 1.75 | 48.89 | 1.75 |
| ch06 → ch07 (LIÊN TỤC) | 50.14 | 0.07 | 0.07 |
| ch03 → ch04 (LIÊN TỤC) | 1.31 | 16.30 | 1.54 → sửa → 0.10 |

Không bảng nào **trông** sai. Cả hai đều điền đủ, thẳng cột, có ✓ và ✗ hợp lý. Nếu tin bảng A
thì bốn chương lành bị dựng lại; tin bảng B thì một cú cắt thật bị coi là hỏng.

Chỉ có một ranh giới mà **cả hai bảng cùng báo sai** — `ch03 → ch04` — và đó là ranh giới duy
nhất hỏng thật. Sự trùng khớp giữa hai lần đo độc lập là thứ đã cứu phép đo.

**Luật rút ra:** một phép đo ghi file tạm phải đặt tên theo tiến trình và theo mục đo. Đây là
dụng cụ, và một dụng cụ có thể tự nhiễu chính nó thì không phải dụng cụ. Đã đưa vào
`tools/check-continuity.mjs` (mkdtemp theo tiến trình, xoá ngay sau khi dùng).

**Luật thứ hai, đắt hơn:** trước khi hành động theo một bảng số, hãy hỏi *bảng này có thể sai
theo kiểu vẫn trông đúng không*. Ở đây câu trả lời là có, và cách kiểm là đo lại một ranh giới
bằng tay: `ch02 → ch03` báo 11.94 trong khi đo trực tiếp ra 0.09, và bản đồ chênh lệch chỉ có
**9 pixel** khác nhau trên 2 triệu.

---

## Dải quét: máy đang đỗ là một VỊ TRÍ, không phải một VÙNG

CH3 beat 1 — *"autovacuum tồn tại nhưng không chạy liên tục"* — cần cỗ máy có mặt mà không
chạy. Bản đầu để nó đỗ thành **dải phủ hai hàng đầu** ở opacity .22.

Ba hệ quả, phát hiện theo đúng thứ tự này:

1. **Ngữ nghĩa.** `--authoritative` là màu của cỗ máy dọn. Phủ nó lên 22 ô **sống** trong 15s
   là nói một điều không đúng về những ô đó. Tệ hơn: ở beat 2 các phiên bản chết đi ra khỏi
   ô của chúng, và một số đi ra **từ dưới lớp phủ**.
2. **Liên tục.** CH4 mở ra không có dải → ranh giới `ch03 → ch04` đo 1.54 (38165 px khác nhau,
   đúng vùng y 384..600). Dải là **một vật trong thế giới bền**, không phải trang trí của
   một chương, nên nó phải bắc qua ranh giới.
3. **Contrast — do gate bắt.** Thử dời dải lên *trên* thế giới thì nó nằm sau dải thanh ghi:
   `#cDead` rơi xuống **2.67:1** trên một nền đã bị dải làm sáng lên. WCAG AA cần 3:1.

Cách sửa không phải dời dải đi đâu nữa mà là đổi *trạng thái* của nó: máy đang đỗ là **một
đường 4px trên mép cấp phát**, không chạm ô nào; khi autovacuum tới lượt thì đường **dày lên
thành dải** rồi mới chạy. Cùng một vật, hai trạng thái, và cú dày lên chính là beat.

Kiểm ở độ phân giải gốc, 7 khung sát mép: CH3 @0.5s không có gì · @2.0s có đường · @13.0s vẫn
đường · CH4 @0.3s thừa hưởng đúng đường đó · @1.3s vẫn đường · @2.1s đã dày thành dải ·
@2.6s dải bắt đầu đi xuống. Ranh giới `ch03 → ch04` sau khi sửa: **0.10**.

---

## Bug 5 — hai dãy `counter()` trong cùng một ô

`counter()` ẩn giá trị trước **của chính nó** một khung trước giá trị sau. CH10 gọi nó hai lần
ở cùng toạ độ, nên hai dãy cùng hiện: `n_dead_tup` render ra `02` (0 đè lên 22) và
`last_autovacuum` ra `vừalxong`.

Cùng họ với lỗi "hai `gsap.set` ở thời điểm y hệt" — nhưng ghi lại thì không ngăn được lần sau.
Nên `counter()` giờ **ném lỗi build** khi một ô đã có dãy, và nhận màu theo từng giá trị để
một dãy có thể đổi màu giữa các giá trị. Đã thử chặn theo cả hai chiều: lời gọi thứ hai cùng ô
bị chặn, ô khác vẫn chạy.

---

## CH10 — nhân chứng sai

CH10 bản đầu là bốn câu chữ xếp dọc cạnh một hình thu nhỏ **bất động**, và hình đó là bảng đã
gói chặt sau VACUUM FULL: 0 dòng chết, và cũng không bloat. Nó nằm ngay cạnh câu *"dòng chết
bằng 0 không chứng minh hết bloat"* — trạng thái duy nhất mà câu ấy **không** nói về. Comment
trong code còn khẳng định "extent của nó vẫn là mốc nước cao nhất", điều đã **sai** sau khi CH9
viết lại bảng. Lý lẽ của chính đoạn code là chỗ hỏng.

Lời thoại chỉ ra hai thiết bị đã có: *"mốc nước vẫn nằm nguyên đó"* = khung cấp phát;
*"bloat là chênh lệch, không phải kích thước"* = thước. Nên chương dựng lại quanh chúng, không
thêm từ vựng mới: **khung đứng im từ beat 3 tới hết chương trong khi ruột mang ba nghĩa** —
dòng chết leo lên · về 0 mà biên không đi theo · ruột đầy bằng dòng thật, cùng kích thước,
chênh lệch tự đóng.

Đo tại 5 mốc: `[586..1303] × [196..983]` không đổi một pixel.

**Luật rút ra:** khi một chương đặt một khẳng định cạnh một hình, hãy hỏi *hình này có phải
nhân chứng cho khẳng định đó, hay chỉ đang ở đó*. Một hình đúng về mặt kỹ thuật vẫn có thể là
nhân chứng sai.

---

## Bug 6 — sàn quét cố định trong dụng cụ đo biên

`check-vacuum-invariant` quét từ `y >= 400` với lý do "thế giới trong video này không bao giờ
nằm trên y=400". CH10 phá vỡ điều đó: thanh ghi của nó ở 376, thế giới ở 600, nên viền khử
răng cưa của chữ `--ink` lọt vào dải luma và hộp đo phình thành `[400..1303] × [117..983]` —
rộng hơn cái khung nó phải theo dõi. **Vẫn đạt**, nhưng một hộp có lẫn thứ khác thì có thể
đứng im trong lúc khung dịch.

Sàn quét thuộc về shot, không thuộc về dụng cụ: `extent_invariant.y_min`. Và tên khai báo đổi
từ `vacuum_invariant` sang `extent_invariant` — tính chất kiểm được luôn là *"biên cấp phát
không đổi qua cửa sổ này"*; VACUUM chỉ là lý do đầu tiên để khai nó, không phải bản thân nó.
CH6 khai cùng tính chất với lý do khác (*"ổn định thì ngừng lớn"*), CH10 khai từ phía dụng cụ đo.

---

## CH2 và CH6 — chỗ đứng im phải là thứ ĐÚNG

Hai chương có lời chạy trên khung đã dừng hẳn. Cả hai đều lọt qua `check-beat-sync`, vì mỗi
*cửa sổ beat* đều có chuyển động — khoảng trống nằm **giữa** các cửa sổ.

**CH2**: 4.25s không đổi một pixel ở nửa sau beat 0 (*"mỗi đơn hàng bị UPDATE vài lần"*). Cơ
chế không được hiện trước khi được gọi tên, nên chỗ thiếu là **dân số đang được đọc**: các ô
hé lộ theo thứ tự đọc, mỗi ô đã ở đúng ô và đúng trạng thái cuối, chỉ opacity động. Thế giới
đang được *nhìn*, không phải đang được *dựng*.

**CH6**: tám lần ghi bị dồn hết vào beat 1, nên beat 2 — *"ổn định thì ngừng lớn, nó chỉ không
nhỏ lại"* — chạy 3.46s trên một khung đã dừng. Cái đó đọc ra thành *"không có gì đang xảy ra"*,
mà đó không phải khẳng định. Khẳng định là **việc vẫn chạy mà biên vẫn không đi**. Cùng tám
thao tác, cùng thứ tự, chỉ giãn lịch ra cả hai beat — mô phỏng không đổi, CH7 thừa hưởng đúng
thứ nó vẫn thừa hưởng. Lời-trên-khung-đứng: 3.46s → 0.00s.

**Luật rút ra:** khi một cảnh khẳng định "cái này không nhúc nhích", phải có **thứ khác đang
nhúc nhích** để sự đứng im có nghĩa. Đứng im hết cả khung là đang cho thấy rằng không có gì
đang xảy ra.

---

## `hero_frames: []` — gate báo sạch mà chưa kiểm gì

Cả 11 chương sản xuất khai `hero_frames: []`. Gate vẫn báo "clean", và **tự nói ra chỗ hở** ở
cả 11: *"no hero frame within 0.6s of the end — the final held state is where layout defects
survive the gate"*. Khung giữ cuối là đúng chỗ một cú chồng lấp hay che khuất đứng yên đủ lâu
để bị thấy.

Đã khai theo **beat đo được** chứ không chọn bằng mắt: mỗi beat + 1.4s (beat đã đáp, chuyển
động của nó đã lắng), cộng khung giữ cuối. Gate lại 11 chương → sạch thật, và chính lần đó nó
bắt được lỗi contrast 2.67:1 của CH3.

**Luật rút ra:** một cổng kiểm chỉ chứng minh sự vắng mặt của những lỗi nó **được chỉ chỗ để
tìm**. "Clean" trên một danh sách rỗng không nói gì cả.
