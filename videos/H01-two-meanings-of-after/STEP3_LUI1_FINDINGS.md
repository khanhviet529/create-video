# H01 · Step 3 · LÙI 1 — bao hàm tiền tố

Nguồn `f62837859b1d1a2f…` · provenance **CURRENT**. Câm. Replay **NON-AUTHORITATIVE** — không
có số nào từ replay ở đây. Ba shot, gate sạch cả ba:
`p-l1-prefix` (26s) · `p-l1-neg-overlap` (8s) · `p-l1-neg-uncovered` (8s).

---

## PHÁN QUYẾT

> **THẾ GIỚI: ĐẠT. CÂU HỎI ĐƯỢC HỎI: TRƯỢT.**

Lùi 1 sửa được **mọi thứ đã giết R1** — và không trả lời câu hỏi mà R1 với Lùi 1 tồn tại để trả
lời. Nó không **thực hiện** một cú đổi cách nhìn nào; nó bày sẵn một quan hệ tĩnh rồi để người
xem tự suy ra.

---

## Sáu câu

| | câu | kết quả | số đo |
|---|---|---|---|
| **1** | *"cùng hai sự kiện, khác cách nhìn"*? | **TRƯỢT một phần** | dấu bất động **(0,0) ở 6 mốc**, cả hai dấu. Nhưng **không có sự kiện hình nào thực hiện cú đổi cách nhìn** — cả hai cách đọc cùng tồn tại tĩnh, và người xem phải tự nối |
| **2** | hai vật không liên quan? | **KHÔNG — đạt** | một đường lịch sử duy nhất, hai đoạn bao trên nó |
| **3** | hàm ý **tốc độ**? | **ĐẠT — không hàm ý** | chuyển động chỉ ở các sự kiện rời rạc (0.5–2.25 · 3.25–4.75 · 7.0–8.5 · 10.5 · 12.75 · 15.25 · 19.5–20.5). **Không lúc nào hai vật cùng chuyển động ở hai nhịp khác nhau**. Vật node duy nhất động thì động **một lần, tới một đích** |
| **4** | tự giải thích khi nhãn không chở cơ chế? | **ĐẠT — dứt điểm** | cắt bỏ **cả hai nhãn** (y 894–1206) rồi xem ở kích thước gốc: hai đoạn bao, một dài hơn; đầu mút ngắn nằm đúng dưới dấu rỗng; đầu mút dài nằm đúng ở dấu đặc. **Cơ chế sống sót; chỉ THÂN PHẬN mất** (không biết đoạn nào của node nào) — đó là danh tính, không phải cơ chế |
| **5** | giữ thân phận qua phép biến đổi? | **KHÔNG ÁP DỤNG** | không có phép biến đổi nào trong bản dựng này. "Đạt" ở đây là đạt rỗng, và đạt rỗng không phải đạt |
| **6** | bao hàm đọc được ở **mọi** điểm, kể cả nơi không gì đang đổi? | **ĐẠT** | hai đầu mút quan sát được riêng: primary kết ở **x=802**, replica kết ở **x=617**, cách nhau **185px**. **L1 không tái diễn** |

---

## R15 — và luật kiểm câm cho nó

**Khẳng định:** *500 vẫn hiện hữu; "ngoài" là một **quan hệ**, không phải một sự vắng mặt.*

**Luật kiểm câm** — bản dịch của luật đếm dấu ở R1 sang ngữ pháp bao hàm. Ở R1, *tồn tại* =
**còn trên màn hình**. Ở đây, *tồn tại* = **được một tiền tố phủ**:

> Dấu ở vị trí 500 phải (i) **có mặt** và (ii) **tâm của nó nằm trong đoạn bao của primary**,
> ở mọi khung sau khi nó xuất hiện.

Không nhãn nào tham gia. Kết quả:

```
11s:trong(799≤802)  13s:trong(799≤802)  15s:trong(799≤802)  17s:trong(799≤802)  19s:trong(799≤802)
```

**ĐẠT.** Negative control `p-l1-neg-uncovered` (primary cũng dừng ở 499) báo
`NGOÀI(799≤617)` ở cả 5 mốc — **phép kiểm có nổ thật**.

---

## Kết luận: ĐẢO THỨ TỰ hay LOẠI TRỪ?

**Đã thành LOẠI TRỪ.** Và đây là phát hiện lớn nhất của lượt này.

Xem ở kích thước gốc, không nhãn: thứ nổi lên là *"500 nằm ngoài đoạn bao dưới"*. Cú **đảo** —
tới muộn hơn, đứng ở vị trí sớm hơn — chỉ được chở bởi **thứ tự xuất hiện** (W ở 10.4s, R ở
12.8s), tức một thứ **không tồn tại trong khung tĩnh** và rất mờ khi xem động.

Về toán thì tiền tố có thứ tự toàn phần, nên `observation_order_matches_real_order` vẫn chở
được — 499 nằm bên trái 500 trên đường lịch sử. Nhưng **thiết bị nổi bật là đoạn bao, và đoạn
bao phát biểu tư cách thành viên chứ không phát biểu thứ tự.**

Điều này va thẳng vào lời thoại. Beat 18 dùng đúng một từ thứ tự:

> *"Nó xảy ra **trước** câu ghi, nếu đo bằng vị trí trong log."*

Loại trừ không giao được chữ **"trước"**. Nó giao *"không nằm trong"*.

Phân bố cụ thể: Lùi 1 phục vụ **rất tốt** beat 11 (*"nó thấy đúng thế giới ở vị trí 499"*) và
beat 20–24 (không gian bảo đảm), và **phục vụ thiếu** beat 18.

---

## Mô hình tư duy sai đã phơi ra

> **Một quan hệ TĨNH có thể vừa đúng, vừa đọc được, mà vẫn không dạy được một sự ĐẢO.**

Đổi *"sau"* thành *"trong/ngoài"* làm mất đúng cái từ mà beat 18 cần, và — sâu hơn — nó thay
một **sự kiện người xem chứng kiến** bằng một **suy luận người xem phải tự làm**.

R1 có một biến đổi được **thực hiện** trên nền hình học nói dối.
Lùi 1 có hình học trung thực và **không thực hiện biến đổi nào**.

Cả hai lần, thứ thiếu đều nằm ở chỗ khác với chỗ tôi đang nhìn.

---

## Hai phép kiểm — khẳng định, kết quả, negative control

Mỗi phép đo **đúng khẳng định của nó**, theo L2.

**A · đầu mút riêng** — *"quan hệ bao hàm đọc được ở mọi điểm"*.
Khẳng định thật: mỗi tiền tố có một **đầu mút quan sát được**; cái mất khi hai thanh chồng mức
chính là đầu mút của thanh ngắn.
`p-l1-prefix` 802 vs 617, cách 185px → **ĐẠT**.
`p-l1-neg-overlap` 802 vs 802, cách **0px** → **nổ đúng**.

**B · R15** — như trên. `p-l1-prefix` **ĐẠT** 5/5 · `p-l1-neg-uncovered` **nổ đúng** 5/5.

### Dụng cụ đã sai lần đầu — lần thứ hai liên tiếp, ở đúng lỗi L2 cảnh báo

Bản đầu của **cả hai** phép đo đo một đại lượng **thay thế**, không đo khẳng định:

- **A** giao tập **chỉ số cột** của hai thanh. Hai thanh ở hai mức khác nhau đương nhiên dùng
  chung các cột x — *giao nhau ≠ che nhau*. Nó báo `448 cột giao nhau` cho hai thanh cách nhau
  **288px theo chiều dọc**.
- **B** so **mép phải** của dấu với đầu mút thanh. Dấu là một đĩa 28px **đặt giữa** vị trí 500,
  nên nó luôn tràn qua 500 một bán kính. Báo `NGOÀI(810≤802)` cho một dấu nằm đúng chỗ.

Cả hai lỗi đều **trông như artifact hỏng**. Đây là lần thứ hai liên tiếp phép đo đầu tiên của
tôi đo một đại lượng gần đúng, sau khi vừa viết L2 ra thành bài học. Ghi lại: **viết được luật
không có nghĩa là đã áp được luật** — chỉ negative control mới phân biệt được "artifact hỏng"
với "dụng cụ hỏng", và ở cả hai lần chính negative control (nổ đúng) là thứ nói cho tôi biết
phải nghi ngờ phép đo chứ không nghi ngờ khung hình.

---

## Khuyết tật đã thấy, chưa sửa

**Dải khe hở tô `--stale` phủ nửa trái dấu ở 500.** Dải đánh dấu *"khoảng vị trí replica chưa
áp"* — một quan hệ — nhưng `--stale` là màu báo động, và vật bị nó tô một nửa lại chính là
**giá trị đã commit đúng**. Đó là gán sai màu: cửa sổ không "xấu", và W lại càng không.
Ghi lại thay vì lặng lẽ sửa, vì phán quyết là về artifact như đã dựng.

---

## Đề xuất — CHƯA THỰC HIỆN

Theo §7: không tự chuyển sang Lùi 2 (sàn), không tự escalate.

**Biểu diễn trung thực thứ ba, dẫn xuất từ bằng chứng chứ không từ doctrine:** thế giới bao hàm
của Lùi 1 **giữ nguyên** (nó đã đạt ở Q3, Q4, Q6, R15), và cú **đổi cách nhìn được THỰC HIỆN
bên trong nó** thay vì bày sẵn — hai sự kiện được duyệt lại **một lần theo thứ tự tới** và
**một lần theo thứ tự vị trí**, trên đúng đường lịch sử đó, dấu không dịch. R1 đã chứng minh
*"dấu bất động qua đổi cách nhìn là dựng được"* (0px, hai lần độc lập); Lùi 1 đã chứng minh
*"nền bao hàm là trung thực và đọc được"*. Cái còn thiếu là **một sự kiện**, không phải một thế
giới mới.

**Hoặc** escalate xin Content Agent một điểm tựa bằng lời cho
`observation_order_matches_real_order` ở beat 18.

**Việc escalate là quyết định của reviewer, không phải của tôi.** Tôi không tự chuyển.
