# G01 — review toàn phim

`output/final.mp4` (trùng bit với `prototype_11of11_voiced.mp4`) · 1080×1920 · **175.50s** · 5265 khung · 30fps
Tiếng: `namtre_v2` @ speed 1.00, 38/38 segment xác minh qua `/history`, tổng lời 156.69s.

Xem liên tục hết 175.5s, rồi đo lại từng khẳng định trên **artifact**. Mọi số dưới đây đến
từ phép đo, không từ đọc code.

---

## Trạng thái các phép kiểm

| kiểm | kết quả |
|---|---|
| gate (11 chương, hero_frames theo beat đo được) | sạch cả 11 |
| `check-continuity` — 10 ranh giới | khớp khai báo cả 10 |
| `check-beat-sync` — 38 beat | cả 38 đều có chuyển động |
| `check-vacuum-invariant` — bất biến biên | 6 shot đạt |
| khung gần trống | không có quãng nào dưới 0.35 |
| lặng trên khung đã đứng | 17.5s / 175.5s (10.0%), dài nhất 2.88s < ngưỡng 3.0s |
| quãng đứng giữa chương | dài nhất 3.00s |
| lời trên khung đứng | dài nhất 1.94s |

---

## Mười một câu hỏi của Step 5

### 1. Thế giới bền có thực sự *bền*?

Đo được, không phải cảm nhận: so khung cuối chương này với khung đầu chương kế.

```
ch01 → ch02    1.75   CẮT       ✓
ch02 → ch03    0.09   LIÊN TỤC  ✓
ch03 → ch04    0.10   LIÊN TỤC  ✓
ch04 → ch05    0.41   LIÊN TỤC  ✓
ch05 → ch06    0.12   LIÊN TỤC  ✓
ch06 → ch07    0.07   LIÊN TỤC  ✓
ch07 → ch08    0.19   LIÊN TỤC  ✓
ch08 → ch09    0.17   LIÊN TỤC  ✓
ch09 → ch10   48.13   CẮT       ✓
ch10 → ch11   38.59   CẮT       ✓
```

Bảy ranh giới khai LIÊN TỤC đều dưới 0.41 — thực tế bảy chương từ CH2 tới CH9 là **một
thế giới không gián đoạn** dài 137s. Ba cú CẮT đều đo ra khác hẳn.

Một cảnh báo phải nói thẳng: `ch01 → ch02` đạt ở mức **1.75**, chỉ nhờ trên ngưỡng 1.2.
Đó là cú cắt giữa hai khung gần như trống (mực 2.65 và 1.00), nên phép đo trung bình
toàn khung không có gì để bám. Ở ranh giới đó con số nên đọc là *"dụng cụ không phân biệt
được"*, không phải *"đạt"*.

### 2. Hiểu biết có tích lại, hay reset mỗi chương?

Mực trung bình mỗi khung (đã trừ sàn 25.00 của yuv420p limited range):

```
chương                 đầu   cuối     Δ
ch01-quan-sat          1.00   2.65   +1.65
ch02-co-che-ghi        1.00  52.67  +51.67    thế giới được đọc vào
ch03-nguong           52.67  52.74   +0.07    vòng đi-về giải tích trả về đúng chỗ
ch04-cu-lat           52.74  48.95   -3.79    VACUUM lấy mực đi, không lấy biên đi
ch05-doc-lai-con-so   48.63  49.98   +1.36    thước tới
ch06-on-dinh          49.96  51.61   +1.65    ghi tiếp vào chỗ đã có
ch07-cach-sua         51.61  50.06   -1.55    sweep dồn dập
ch08-vacuum-vo-ich    49.96  52.31   +2.35    chết đọng lại
ch09-viet-lai         52.23  49.32   -2.91    viết lại, gói chặt
ch10-cong-cu-do        1.00  39.69  +38.69    chương tự dựng thế giới của nó
ch11-cau-hoi           1.00   2.51   +1.51
```

Từ CH3 tới CH9 thế giới không lần nào về lại mức mở màn — nó dao động quanh 49–52 và
**mỗi lần dao động là một cơ chế**, không phải một hiệu ứng. `ch03` Δ = +0.07 là con số
đáng giá nhất bảng: vòng đi-về vật lý → giải tích → vật lý trả thế giới về gần **đúng
từng phần trăm**.

### 3. CH2 dài 29s có còn sống không?

Có, sau khi sửa. Trước đó nó có **4.25s không đổi một pixel** (t 2.0 → 6.25), rơi đúng vào
nửa sau beat 0 — *"mỗi đơn hàng bị UPDATE vài lần"*. Cơ chế không được phép hiện trước khi
được gọi tên, nên chỗ thiếu không phải cơ chế mà là **dân số đang được đọc**: các ô hé lộ
theo thứ tự đọc suốt trọn beat, mỗi ô đã ở đúng vị trí và đúng trạng thái cuối, chỉ opacity
động. Không có gì được *tạo ra* — thế giới đang được *nhìn*.

Sau khi sửa, beat 0 kín chuyển động (YMAX 94–198 liên tục từ 0.25s tới 5.00s) và lắng
đúng lúc beat 1 mở. Quãng đứng dài nhất trong cả chương còn 1.25s.

### 4. CH10 có phá vỡ ngôn ngữ hình không?

Bản đầu **có**, và tệ hơn thế: nó là một slide bốn câu chữ cạnh một hình thu nhỏ bất động,
và hình đó là **nhân chứng sai**. Thumbnail là bảng đã gói chặt sau VACUUM FULL — 0 dòng
chết và cũng không bloat — nằm ngay cạnh câu *"dòng chết bằng 0 không chứng minh hết
bloat"*. Đó là trạng thái duy nhất mà câu ấy **không** nói về.

Chính lời thoại chỉ ra hai thiết bị đã có sẵn:

> *"Mốc nước vẫn nằm nguyên đó"* → khung cấp phát
> *"Bloat là chênh lệch, không phải kích thước"* → thước đo

Nên chương được dựng lại quanh hai thứ đó, không thêm từ vựng nào mới: **khung cấp phát
đứng im từ beat 3 tới hết chương trong khi ruột nó mang ba nghĩa khác nhau** — dòng chết
leo lên (thu hồi không theo kịp), về 0 mà biên không đi theo (số đọc không chứng minh gì),
rồi ruột đầy dần bằng dòng thật (cùng kích thước, chênh lệch biến mất).

Đo trên artifact tại 5 mốc (11.3s, 13.5s, 16.4s, 18.5s, 21.5s): biên `[586..1303] ×
[196..983]` **không đổi một pixel**. Chữ còn lại: một tiêu đề, hai tên cột, hai ô đọc số,
một dòng chẩn đoán, và hai neo hai chữ (`mốc nước`, `chênh lệch`) gắn vào hình học.

### 5. Các cú đổi mức trừu tượng có hiểu được không?

Ba lần đổi mức, cả ba đều giữ nguyên thân phận của vật:

- **CH3** vật lý → giải tích → vật lý. Mỗi phiên bản chết đi xuống khối đếm và **để lại một
  ghost giữ chỗ**, rồi về đúng ô cũ. Thế giới chưa bao giờ nói rằng một tuple đã dịch chỗ.
- **CH5** thế giới → thước. Thước tới **muộn**, như câu trả lời cho một câu hỏi người xem đã
  bắt đầu tự hỏi. Đại lượng nằm trên trục, không bao giờ vẽ thành một khung quanh một tập ô —
  đây là chốt ngữ nghĩa của Step 4 và nó được giữ.
- **CH10** thế giới → dụng cụ đo. Bước ra bằng cách **đọc** thế giới, không bằng cách mô tả nó.

Hai thanh ghi `phiên bản sống / phiên bản chết` chỉ tồn tại ở CH2–CH4 rồi nghỉ khi thước
tới ở CH5. Ranh giới đó đo ra 0.41 — chênh lệch nằm gọn trong dải thanh ghi (5321 px ở
y 248..341). Đó không phải đứt mạch mà là **bàn giao**: dụng cụ đếm nhường chỗ cho dụng cụ
đo tốt hơn, đúng lúc chương nói *"đọc lại con số"*.

### 6. Vòng vật lý ↔ giải tích có trung thực không?

Có, và nó là con số Δ +0.07 ở câu 2. Thêm nữa, chốt ngữ nghĩa *"khung bên trong là phép đo,
không phải một vùng vật chất"* được giữ bằng hình học chứ không bằng lời: lượng "dữ liệu sống
cần" **chỉ bao giờ** xuất hiện dưới dạng độ dài trên trục, không bao giờ là một khung bao
quanh một nhóm ô.

### 7. VACUUM và VACUUM FULL có phân biệt được không?

Không thể lẫn:

- **VACUUM** (CH4): dải quét chạy qua, ô chết thành ô trống, và biên `[416..1293] ×
  [76..1039]` **không đổi** qua cửa sổ 1.9s → 12.7s. Mực giảm 3.79; biên giảm 0.
- **VACUUM FULL** (CH9): cả thế giới cũ **xám đi**, một thế giới mới được viết bên dưới nó,
  rồi cái cũ biến mất. Hai bản cùng tồn tại trên màn hình chính là *"cần thêm đĩa"*, và cái
  khoá là toàn bộ bản cũ đứng im trong lúc bản mới lớn lên.

Bất biến chỉ được khai ở nơi nó đúng. Không có luật chung nào kiểu *"file Postgres không bao
giờ nhỏ lại"* được viết vào tooling — package nói rõ VACUUM FULL làm file nhỏ lại, và chương
viết lại đơn giản là **không khai** bất biến đó.

### 8. Camera có giải thích được gì không?

Không chương nào có camera. Cả 11 đều `static`, và giờ đó là **quyết định có lý do**, không
còn `under_test`.

Cú `vào gần CH1 → CH2` từng được ghi là "earned, còn phải tự chứng minh ở Step 5" — nay
chuyển sang **rejected** kèm số đo: đổi mức trừu tượng là thật nhưng **đã có người mang** —
lượt hé lộ dân số chiếm trọn beat 0 với YMAX 94–198 liên tục. Camera đặt lên đó là chuyển
động thứ hai nói lại cùng một điều. Và nó **không có chủ thể**: trong CH1 không có vật nào
trở thành thế giới CH2 — thanh dung lượng là phép *đo* cái bảng, không phải ruột bảng.

Cú `lùi ra CH4 → CH5` vẫn rejected từ P3 (thu ô xuống 62%, không thêm thông tin, và triệt
tiêu một phần chính tín hiệu "lớn lên").

### 9. Có thói quen bố cục / chuyển động nào bị lặp?

Kiểm tra thật, và tìm ra được:

- **Có một thói quen thật:** dải quét vàng. Nó xuất hiện ở CH3, CH4, CH7, CH8, CH10 — năm
  chương. Nhưng nó là **cùng một cỗ máy**, không phải cùng một hiệu ứng: mỗi lần chỉ khác
  *kết quả* (đỗ im · dọn được · dọn dồn dập · chạy mà không thu được gì · số về 0 mà biên
  không đi). Một vật lặp lại là ngữ pháp; một hiệu ứng lặp lại mới là thói quen.
- **Một thói quen đã bị bắt và sửa:** máy dọn lúc đỗ từng là một **dải phủ** che 22 ô sống
  bằng `--authoritative` ở opacity .22 suốt 15s. Màu đó nghĩa là "cỗ máy dọn", nên phủ nó
  lên tuple sống là nói một điều không đúng về những tuple đó. Máy đang đỗ không phải một
  *vùng* — nó là một *vị trí*: giờ nó đỗ thành **một đường 4px trên mép cấp phát**, không
  chạm ô nào, và khi autovacuum tới lượt thì đường **dày lên thành dải**. Cú dày lên đó
  chính là beat.
- **Chưa bị bắt:** cả 11 chương dùng cùng một hướng nhìn trực giao, cùng một tỉ lệ ô, cùng
  một trục dọc. Xem mục "V2.1" dưới đây.

### 10. Có nhãn nào mang cơ chế mà animation không giải thích được?

Có — và đó chính là CH10 bản đầu, đã dựng lại (câu 4). Sau khi sửa, đếm lại toàn phim:

- CH1: `bảng đơn hàng`, `số dòng`, `1 000 000`, `dung lượng`, `sáu tháng trước / hôm nay` —
  đây là *bài đọc* mở đầu, chữ là đúng chỗ.
- CH3: `ngưỡng · 20% số dòng của bảng` — package nói thẳng con số này; bỏ đi thì việc bảng
  phải mang chỗ dư thành vô lý.
- CH5: `bloat` — một từ, đặt đúng vào khoảng trống giữa hai đầu thanh.
- CH7: `nếu hạ ngưỡng từ đầu` — nhãn của một thế giới phản-thực.
- CH10: hai tên cột (thứ người xem sẽ gõ), hai ô đọc số, một dòng chẩn đoán, hai neo hai chữ.
- CH11: câu hỏi đóng.

Không chương nào có đoạn văn, panel code, hay trang tài liệu. Ngân sách chữ của Step 4 được giữ.

### 11. "Chính khái niệm đã thành chuyển động" hay "thông tin kỹ thuật được làm cho động"?

Chủ yếu là cái thứ nhất, và có thể chỉ ra chỗ nào:

- *"UPDATE không sửa tại chỗ"* → một ô chết đi **tại chỗ nó đang nằm** và một ô sống hiện ra
  **ở chỗ khác**. Không có nhãn nào nói "phiên bản mới".
- *"Số dòng đứng yên"* → số 88 không đổi trong khi vùng bị chiếm lớn dần. Kiểm được bằng mắt.
- *"File không nhỏ đi một byte"* → sweep chạy hết chiều cao thế giới và **biên không nhúc
  nhích**. Sự vắng mặt của chuyển động là khẳng định — và nó được đo, không phải được xem.
- *"Mốc nước thì chỉ đi lên"* → invariant `monotonic` trong replay, cộng với biên chỉ lớn lên.
- *"Bloat là chênh lệch"* → khoảng cách giữa hai đầu thanh, và ở CH10 khoảng cách đó **tự
  đóng lại trong khi kích thước không đổi**.
- *"Ổn định thì ngừng lớn, chỉ không nhỏ lại"* → tám lần ghi **vẫn chạy** suốt câu nói đó
  trong khi biên đứng im. Chỗ đứng im phải là *biên*, không phải *thế giới* — nếu churn cũng
  dừng thì cảnh chỉ đang cho thấy rằng không có gì đang xảy ra.

Chỗ còn nghiêng về "làm cho động": **CH1** (chữ + một thanh lớn dần) và **CH11** (chữ), tổng
16.5s / 175.5s. Cả hai là khung mở và khung đóng, cố ý đối xứng: mở bằng một khẳng định, đóng
bằng một câu hỏi, thế giới nằm giữa. Chấp nhận được.

---

## Những gì V2.1 sẽ đọc từ đây (không sửa G01)

Ba khoảng trống thật, ghi lại để mang sang benchmark sau chứ **không** dựng lại G01:

1. **Bền không đồng nghĩa với biến đổi.** G01 có ba lần đổi *biểu diễn* (CH3, CH5, CH10) —
   nhưng cả ba đều xảy ra bằng cách **thêm một lớp cạnh thế giới**, không phải bằng cách
   thế giới tự biến thành biểu diễn khác. Không có morph nào giữ thân phận xuyên qua một
   phép biến đổi hình học thật.
2. **Tỉ lệ không đi đâu cả.** Ô luôn 76px (CH10 dùng 60px, nhưng đó là chương khác chứ không
   phải một hành trình tỉ lệ). Không có chặng `vật → cơ chế cục bộ → cấu trúc hệ → hệ quả
   tổng → về lại vật`. Thế giới bền, nhưng nó bền **ở đúng một khoảng cách nhìn**.
3. **Không gian trống chưa được giao việc ở mọi chương.** Chỗ trống *bên trong* khung có
   nghĩa rất rõ (chỗ dùng lại được, chưa bị chiếm). Chỗ trống *ngoài* khung — nửa dưới màn
   hình ở CH2, CH3, CH6 — phần lớn chỉ là chỗ trống.

---

## Quyết định — ĐÓNG BĂNG

**Human listen review: đạt.** G01 đóng băng ở `FROZEN_BENCHMARK`.

`output/final.mp4` · 175.500s · 5265 khung @ 30fps · 1080×1920 · aac 24000Hz
`sha256 c3816f8ad7fa06674f798c3ac90f1eca7b242665daf686c09529f74963816689`
— trùng bit với `prototype_11of11_voiced.mp4`: đóng băng không dựng lại gì, chỉ đổi trạng thái.

Xác minh toàn vẹn **18/18 mục đạt**, đo trên artifact chứ không lấy từ báo cáo của `compose`:

- thời lượng bằng đúng tổng `shot_plan`, số khung = 30 × thời lượng, tiếng dài bằng hình;
- `shot_timing.built_from_audio_sha256` = `VOICE_PROVENANCE.audio_sha256`;
- **một giọng duy nhất cho cả video** — 38/38 segment mang `profile_id a666ed5a`
  (`namtre_v2` @ speed 1.00), mỗi segment có `audio_id` và `duration > 0`, và tập
  `profile_id` của cả 38 segment có đúng **một** phần tử;
- 11 shot render đủ, tổng bằng bản cắt, mỗi shot còn `index.html` sinh lại được;
- provenance `CURRENT` — `content-package.yaml` không đổi kể từ lúc import.

Bộ kiểm đóng băng bản đầu báo **3 mục trượt**, và cả ba là lỗi của chính nó: đọc
`voice_model.name` (trường thật là `profile_name`), đòi một cờ `verified` per-segment không
hề tồn tại (bằng chứng thật là `audio_id` + `profile_id`), đọc `speech_total_s` (trường thật
là `audio_duration`), và so chuỗi ffprobe mà không cắt ký tự xuống dòng. Một bộ kiểm đọc sai
thứ nó đang đọc thì tệ hơn không có bộ kiểm — sửa xong mới chạy lại.

**Không retrofit V2.1 vào G01.** G01 giữ nguyên là mốc của giai đoạn "thế giới bền"; các bài
học V2.1 nằm ở [docs/VISUAL_ENGINE_V2.1.md](../../docs/VISUAL_ENGINE_V2.1.md) và trong
`creative_memory/G01-bloat-not-row-count.yaml` (6 thiết bị bị loại, 6 giới hạn đã biết), để
áp cho Content Package kế tiếp.
