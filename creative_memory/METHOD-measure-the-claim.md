# PHƯƠNG PHÁP — L2: phép đo phải khớp với khẳng định, không khớp với một đại lượng gần đúng

Ghi ở **mức phương pháp kiểm**. Bằng chứng: `H01/STEP3_R1_FINDINGS.md` và
`H01/STEP3_LUI1_FINDINGS.md`.

---

## Luật

> Một phép kiểm phải đo **đúng điều đang được khẳng định**. Đo một đại lượng thay thế cho ra
> một con số **trông như một kết quả** và không mang thông tin nào về khẳng định.

Ba lần trong hai lượt, phép đo **đầu tiên** của tôi đo một đại lượng thay thế:

| khẳng định | phép đo sai lần đầu | vì sao vô nghĩa | phép đo đúng |
|---|---|---|---|
| *"hai đường song song"* | độ dốc **toàn cục** | đường bậc thang phần lớn phẳng nên cả hai đều ≈ 0 và **"đạt" một cách vô nghĩa** | độ dốc **chỉ trên đoạn dốc**, và mạnh hơn: **residual sau tịnh tiến** |
| *"hai đoạn bao không che nhau"* | giao tập **chỉ số cột** | hai thanh ở hai mức khác nhau đương nhiên dùng chung các cột x — **giao nhau ≠ che nhau**. Báo "448 cột giao nhau" cho hai thanh cách nhau 288px | **đầu mút riêng** của mỗi tiền tố — đúng thứ biến mất khi chúng chồng mức |
| *"dấu ở 500 nằm trong tiền tố"* | **mép phải** của dấu vs đầu mút thanh | dấu là đĩa **đặt giữa** vị trí, nên luôn tràn qua một bán kính. So hai điểm không cùng loại | **tâm** dấu vs đầu mút |

## Hai hệ quả phải nhớ

**1. Viết được luật không có nghĩa là đã áp được luật.**
Lỗi thứ hai và thứ ba xảy ra **bên trong dụng cụ viết ra để tôn trọng L2**, ngay sau khi L2 vừa
được ghi thành bài học. Một luật chỉ có tác dụng khi nó thành một bước kiểm cụ thể, không phải
khi nó thành một câu trong tài liệu.

**2. Negative control là thứ duy nhất phân biệt được "artifact hỏng" với "dụng cụ hỏng".**
Cả ba lần, kết quả sai **trông y hệt một artifact hỏng**. Thứ nói cho tôi biết phải nghi ngờ
phép đo là: negative control **nổ đúng** trong khi shot chính cũng nổ — tức dụng cụ có hoạt
động, nên con số kỳ lạ ở shot chính đáng được chẩn đoán chứ không đáng tin ngay.

> **Mọi phép kiểm mới phải kèm một negative control được dựng CỐ Ý để trượt.**
> Một chặn chưa từng nổ thì chưa phải chặn — và một chặn đã nổ đúng chỗ là thứ cho phép ta tin
> hoặc nghi ngờ mọi số còn lại.

## Cùng họ với

- G01 — *false witness*: một hình đúng về kỹ thuật vẫn có thể là nhân chứng sai cho khẳng định
  đặt cạnh nó.
- G01 — *bộ kiểm quét source không kiểm được một khẳng định về artifact* (`check-beat-sync` báo
  16/38 sai; `check-vacuum-invariant` bản đầu cấm cả những lời gọi hợp lệ).
- G01 — *hai tiến trình đo dùng chung tên file tạm*: bảng số điền đủ, thẳng cột, và **sai**.

Mẫu chung của cả nhóm: **không gate nào tự soi được quan hệ của chính nó với thứ nó định đo.**

---

## CỔNG THỦ TỤC — bắt buộc, trước mọi phép đo

Ghi nhớ ở mức phương pháp **không chặn được** lỗi này: nó xảy ra **trước lúc người ta nghĩ tới
ghi nhớ**. Bằng chứng: lỗi tái diễn **hai lượt liên tiếp**, lần thứ hai xảy ra **bên trong dụng
cụ viết ra để tôn trọng chính bài học này**. Nên nó phải thành một **bước**, không phải một câu.

> **Trước khi chạy BẤT KỲ phép đo nào, khai ba dòng:**
>
> 1. **khẳng định** là gì;
> 2. **đại lượng thực sự đo** là gì;
> 3. **vì sao đại lượng đó KHÔNG phải một thay thế** của khẳng định.
>
> **Không khai được dòng 3 → chưa được chạy phép đo đó.**

Khai trong báo cáo, cho **từng** phép đo. Dòng 3 là dòng làm việc: dòng 1 và 2 ai cũng viết
được, còn dòng 3 buộc phải nêu ra chính cái khoảng cách giữa "thứ tôi đo" và "thứ tôi khẳng
định" — và khi khoảng đó không lấp được thì phép đo sai, phát hiện **trước** khi có số.

### Dấu hiệu chẩn đoán, đã cứu ba lần

> **Negative control nổ đúng TRONG KHI shot chính cũng nổ ⇒ nghi DỤNG CỤ trước, nghi shot sau.**

Cả ba lần, kết quả sai **trông y hệt một artifact hỏng**. Thứ duy nhất phân biệt được là
negative control: nó chứng minh dụng cụ **có hoạt động**, nên một con số kỳ lạ ở shot chính
đáng được **chẩn đoán** chứ không đáng tin ngay. Không có negative control thì cả ba lần đều sẽ
kết thúc bằng việc dựng lại một artifact vốn không hỏng.

### Áp dụng thật — H01 prototype cuối

Cổng được khai trước ở `STEP3_SWEEP_PREDECLARATION.md` cho cả năm phép đo, **trước khi sinh shot
đầu tiên**. Không phép đo nào phải viết lại. Đây là lượt đầu tiên trong bốn lượt không có lỗi
đo-đại-lượng-thay-thế.

---

## CỔNG RGB — bắt buộc khi viết bộ kiểm mới

Cùng một va chạm đã cắn **ba lần**, lần thứ ba xảy ra sau khi bài học đã được ghi rõ trong
header của một bộ kiểm khác. Ghi nhớ không tự áp vào công cụ mới, nên nó thành cổng.

> **Mọi bộ kiểm mới phải KHAI: nó phân loại pixel BẰNG GÌ.**
> Dùng **RGB + biên độ kênh**, không dùng luma, khi hai token màu có luma gần nhau.

**Danh sách va chạm luma đã biết** — thêm vào khi phát hiện cái mới:

| token | hex | luma xấp xỉ |
|---|---|---|
| `--authoritative` | `#C9A227` | **≈168** |
| `--ink-mid` | `#9AA0A6` | **≈160** |

Trên ảnh xám hai token này **không phân biệt được**. Ba lần bị cắn:

1. **R1** — phát hiện lần đầu, ghi vào header `check-parallel-lines.mjs`.
2. **CH-C** — sợi neo gold bị đếm là đoạn bao, khe hở đọc ra 62px thay vì 185px.
3. **`check-prefix-containment.mjs`** — cùng lỗi, **chưa nổ** chỉ vì mọi mốc lấy mẫu nằm trước
   lúc gold xuất hiện. May, không phải đúng. Đã sửa, và cửa sổ kiểm đã mở rộng qua lúc có gold
   để chứng minh bản sửa có tác dụng.

Bộ kiểm **không phân loại** (chỉ tính chênh lệch khung, như `check-sweep-tempo.mjs`, hoặc dùng
`signalstats`, như `check-continuity.mjs`) thì khai rõ điều đó — cổng vẫn phải trả lời.

*(Ghi chú: `check-vacuum-invariant.mjs` của G01 cũng phân loại bằng luma. G01 đã **FROZEN** và
kết quả xác minh của nó gắn với dụng cụ lúc đó, nên **không sửa**. Rủi ro là tiềm ẩn chứ không
hiện thực ở G01 — dải `--ink-dim` 130–158 nằm dưới cả hai token trên. Ghi lại để nếu dụng cụ đó
được dùng cho video mới thì phải áp cổng RGB trước.)*

---

## LUẬT NC — generalizable ngay, không chờ instance thứ hai

> **Một negative control nổ VÌ LÝ DO SAI vẫn là một chặn hỏng.**
>
> NC phải kiểm được rằng nó nổ vì **đúng nguyên nhân đã thiết kế**, không chỉ kiểm rằng nó nổ.

Đây là lỗ hổng trong **chính phương pháp làm bằng chứng**, nên không áp chuẩn "chờ ca thứ hai".

**Hình dạng lỗi đã gặp** (H01, CH-C): một bản vá dùng `String.replace` **không guard** đã âm
thầm không khớp, nên NC ra **không có tween nào**. Nó vẫn "trượt" — nhưng vì *chuyển động 0 ở
cả hai mốc*, chứ không vì *hai số đọc khác nhau* như thiết kế. Bảng kết quả trông đạt. Chỉ đọc
kỹ **con số** mới thấy.

**Cách làm:** in ra đại lượng mà NC được thiết kế để bẻ, và đọc nó — không chỉ đọc dấu ✓/✗.
Ở ví dụ trên, dòng cần đọc là `khe hở (a) 266px · (b) 185px |Δ| 81px`, và nó phải khác dòng
tương ứng của shot chính. Nếu NC nổ mà đại lượng thiết kế **không** khác, thì NC hỏng.

**Hệ quả cho mọi bản vá:** `String.replace` không guard là một lỗi âm thầm. Mọi phép thay thế
trong script vá phải **ném lỗi khi không khớp**.

---

## TIÊU CHÍ DỰNG hay KHÔNG DỰNG — phân loại khẳng định trước khi mở prototype

Ngang hàng với cổng L2 và cổng RGB. Áp trước khi mở bất kỳ prototype nào.

| loại khẳng định | câu hỏi nó trả lời | cần gì |
|---|---|---|
| **CẢM THỤ** | *người xem đọc ra gì?* | **BẮT BUỘC artifact.** Không đo thì chỉ là ý kiến |
| **CẤU TRÚC** | *một biểu diễn có tồn tại không?* | **hình học ĐỦ.** Artifact là dư |

**Ví dụ cảm thụ** — R1: *"phép chiếu có đọc ra 'cùng hai sự kiện, đảo thứ tự' không?"* Lập luận
thiết kế nghe rất thuyết phục và **sai**. Phải có `YAVG 0.0038` mới kết luận được "tiếng vọng".

**Ví dụ cấu trúc** — trần tỉ lệ: *"chiều sâu có tạo được nấc bên trong không?"* Trả lời bằng
hình học: trần đặt bởi **phạm vi**, chiều sâu **trực giao với phạm vi**. Render nó chỉ cho ra
một khung đẹp hơn cùng bốn vị trí đó. Cùng loại: **loại vị từ của một thiết bị** (LAW-2), và
**một biểu diễn thứ hai có tồn tại để xếp chồng không**.

### Khe giữa hai loại, và cách đóng nó

Prototype thứ ba của H01 (cú duyệt) rơi đúng vào khe: pre-declaration **đã kết luận được bằng
cấu trúc** — lượt "theo thứ tự tới" không có vật nào trong khung để neo vào — rồi **vẫn dựng**
để lấy số. Giá trị biên gần bằng không: nó **xác nhận một dự đoán** thay vì trả lời một câu chưa
biết.

> **Nếu pre-declaration đã kết luận được bằng cấu trúc, ĐỪNG dựng để xác nhận nó.**
> Dựng chỉ khi câu hỏi còn lại là *cảm thụ*.

Một prototype dựng để thoả chuẩn chứng minh, chứ không để biết điều chưa biết, là chi phí thuần.

---

## CÁCH LY DỤNG CỤ — `check-vacuum-invariant.mjs`

`check-vacuum-invariant.mjs` phân loại pixel bằng **luma** (dải 130–158 cho `--ink-dim`). G01 đã
**FROZEN**, và kết quả xác minh của nó gắn với dụng cụ ở trạng thái lúc đó, nên **không sửa**.

> **Dụng cụ đó bị CÁCH LY cho G01.**
> Mọi lần dùng nó cho **một video mới** thì **BẮT BUỘC** sửa sang RGB + biên độ kênh **trước khi
> chạy**, theo cổng RGB.

Rủi ro ở G01 là **tiềm ẩn chứ không hiện thực**: dải 130–158 nằm dưới cả `--ink-mid` (≈160) lẫn
`--authoritative` (≈168). Nhưng bảng va chạm luma là thứ **mở rộng theo thời gian**, nên một
palette mới có thể đẩy một token vào đúng dải đó mà không ai nhận ra.

---

## CỔNG L2 — bản mở rộng: khai luôn ĐO Ở ĐÂU

Từ lỗi dụng cụ #5 (LOCK-1: `11px vs 10px` ở một cột, `4px = 4px` ở cột xa chốt đầu mút).

> Ngoài **đo đại lượng gì**, khai thêm **ĐO Ở ĐÂU** và **vì sao vị trí đó đại diện**.
> Nếu đại lượng có thể **biến thiên dọc một trục**, lấy mẫu **≥ 2 vị trí** và nêu cả hai.

Ở lỗi #5, độ dày thanh biến thiên dọc trục x vì hai **chốt đầu mút** vươn ngược chiều nhau và
lọt vào cửa sổ quét. Một mẫu ở một cột không đại diện. Ba cột (`x=300/450/600`) thì đại diện,
và cả ba cho `4/4`.

### Vì sao con số cần theo là "lỗi dụng cụ bị BẮT", không phải "không có lỗi dụng cụ"

Năm lỗi dụng cụ trong cung H01, **cả năm bị bắt**, **chưa lỗi nào dẫn tới một kết luận sai**:

| # | lỗi | bắt bằng gì |
|---|---|---|
| 1 | độ dốc toàn cục trên đường phần lớn phẳng | negative control nổ đúng |
| 2 | giao **chỉ số cột** thay cho **che nhau** | NC nổ trong khi shot chính cũng nổ |
| 3 | **mép** đĩa vs **đầu mút** thanh | cùng dấu hiệu chẩn đoán |
| 4 | va chạm luma `--authoritative` / `--ink-mid` | chẩn đoán phân bố màu |
| 5 | đo độ dày ở **một cột** có chốt vươn ngược | đo lại ở cột xa chốt |

Mục tiêu **không phải** zero lỗi dụng cụ — mục tiêu là **không lỗi nào lọt thành kết luận**.
Con số đúng để theo là *bị bắt / tổng*, và cơ chế bắt là **negative control** cộng thói quen
**nghi dụng cụ trước khi nghi artifact**.

### Và một lỗi cùng họ, ở tầng VERDICT chứ không tầng phép đo

`review-h01-voiced.mjs` bản đầu **in cảnh báo** "vượt đáng kể, rủi ro tĩnh như F01" rồi vẫn
kết **"mọi mục ĐẠT"**, vì mục đó không `fail++`. Một bộ kiểm tự khai ngưỡng rồi không tính
ngưỡng đó vào verdict là **pass gây nhầm** — cùng họ với đo-đại-lượng-thay-thế, chỉ dịch lên
một tầng.

> **Mọi ngưỡng một bộ kiểm tự khai phải tính vào verdict của nó.** Nếu chỉ để in ra thì đừng
> gọi nó là ngưỡng.

### Ngưỡng tự khai mà SAI thì phải RÚT, không phải làm cho im

Quy tắc trên có một mặt thứ hai. Mục C của `review-h01-voiced.mjs` tự khai ngưỡng "12 điểm % so
với G01" và H01 vượt 29 điểm. Nhưng ngưỡng ấy **so hai đại lượng không so được**: G01 mang vị từ
QUÁ TRÌNH, H01 mang vị từ QUAN HỆ (xem `LAW-device-predicate-motion-budget.md`). Hiệu của hai tỉ
lệ giữ khác loại vị từ không phán quyết được gì.

Có ba cách xử, và chỉ một cách đúng:

| cách | vấn đề |
|---|---|
| giữ ngưỡng, thêm chuyển động để hạ % | sửa artifact cho vừa một phép đo sai — và ở H01 nó mở lại LOCK-A |
| xoá `fail++`, giữ dòng cảnh báo | đúng cái **pass gây nhầm** vừa sửa ở trên |
| **RÚT ngưỡng, khai rõ đã rút và vì sao** | ✓ |

> **Rút một ngưỡng là một hành động phải NÓI RA trong chính bộ kiểm.** Mục đó tự khai là
> "ĐO, KHÔNG XỬ", kèm lý do. Không khai ngưỡng thì không có gì để tính vào verdict — nhưng
> việc *không khai* phải hiện ra, nếu không nó thành một chỗ bỏ qua im lặng.

### Mẫu số đúng: ĐẾM BEAT, không phải nhịp trung bình

Mật độ cụm phải chia cho **số beat**, không cho nhịp beat trung bình của chương. `ch-bon-vi-tri`
đạt **1.22 cụm/beat** — nghe như đủ — trong khi vẫn chứa một beat **8.6s** chỉ có một cụm. Trung
bình che khuyết điểm phân bố.

> **Một chương "đủ mật độ" theo trung bình vẫn có thể chứa một beat rỗng.** Phép đo phải chạy
> **trên từng beat**, và bảng phải liệt kê từng beat, không phải một dòng tổng cho chương.

Hệ quả kèm theo, gặp ở lượt 11: một khoảng giữ **9.8s** bị gán cho **một** beat (beat 14) trong
khi nó phủ **hai** beat (14 và 15). Khi beat 14 được chia làm hai cụm, khoảng 9.8s tách ra và
**beat 15 mới lộ ra** như một khoảng giữ riêng 6.0s — chưa từng xuất hiện trong bảng trước đó.

> **Gán một khoảng cho beat mở đầu nó là một phép gán, không phải một phép đo.** Khoảng phải
> được đối chiếu với **mọi** beat mà nó phủ.

### Băm container KHÔNG phải bằng chứng pixel — theo cả hai chiều

Lượt 11 xoá một tween `opacity: 1` áp lên vật đã ở opacity 1 và băm mp4 **đổi**. Kết luận "vậy
tween có tác dụng" là sai. Bảng 2×2 (comment × tween) cho thấy tween vô hiệu ở cả hai cột, và
biến thật là **văn bản comment**. Sau khi bóc comment, JS thi hành **byte-identical, 8150 bytes
cả hai bản** — vậy mà 414/416 khung khác nhau: 6342 pixel/khung lệch >20 tại `x 200..612,
y 1241..1478`, YAVG tối đa 0.18/255. Là **antialiasing subpixel của hai dòng nhãn chữ**; hai ảnh
cắt cận cảnh trông y nhau.

> **Băm mp4 không chứng minh "hình giống nhau", và cũng không chứng minh "code đã đổi".** Muốn
> nói về pixel thì đo pixel: `framemd5`, hoặc so raw rgb24 hai khung trích riêng.
>
> **Renderer này phụ thuộc cả những byte KHÔNG thi hành trong HTML.** Comment trong HTML không
> miễn phí. Ghi chú giải thích để **ngoài** phần phát vào HTML.

Cách dùng đúng của băm, vẫn còn giá trị: chứng minh một shot **không bị sửa**. Renderer đã được
chứng minh xác định ở tầng byte (hai lần render cùng source → cùng băm), nên với 5 shot không
sửa của lượt 11, `html` và `render.mp4` băm trùng trước/sau là bằng chứng đủ.

### Bốn lỗi dụng cụ nữa, lượt 11 — cùng một họ với năm lỗi trước

| # | lỗi | bắt bằng gì |
|---|---|---|
| 6 | `review-h01-mute.mjs` chọn phim bằng `readdir()[0]` — đúng nhờ thứ tự chữ cái, không nhờ chủ ý | đọc lại dụng cụ trước khi tin số của nó |
| 7 | cùng file: lấy đuôi bằng `136 − chuyển_động_cuối`, với 136 là độ dài bản **CÂM** | bản có giọng dài 168.5s ⇒ đuôi sẽ ra số ÂM |
| 8 | `blend=difference` **không nhãn `[0:v][1:v]`** ⇒ `signalstats` đo luma của input 0, không đo hiệu | NC: tự so với chính nó phải ra `YMAX=0` — và nó ra 0 ở cả 416 khung |
| 9 | trích raw rgb24 **qua** `blend` ⇒ "2 073 600/2 073 600 pixel lệch", bất khả với YAVG 0.18 | số vô lý ⇒ nghi dụng cụ; trích riêng hai khung rồi so trong node |

Lỗi #7 là lần thứ tư một **hằng số của artifact cũ** nằm lại trong dụng cụ. Lỗi #8 nhắc lại vì
sao NC phải chạy **mỗi lần**: chỉ một dòng `tự-so-với-chính-nó → 0` đã phân biệt được "đo hiệu"
với "đo input 0".
