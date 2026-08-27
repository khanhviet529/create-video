# ĐỊNH LUẬT — LAW-2, CHIỀU DƯƠNG: chọn hai vị từ KHÁC LOẠI thì việc gộp chúng thành nhị phân trở nên BẤT KHẢ VỀ HÌNH HỌC

LAW-2 (`LAW-device-teaches-only-its-predicate.md`) tới nay chỉ được dùng để **LOẠI**: đoạn bao
phát biểu tư cách thành viên nên không dạy được thứ tự. Đây là chiều **DƯƠNG** của cùng định
luật đó — dùng nó để **DỰNG**. Nguồn: H01 · CH-4 · R4.

---

## Vì sao nó chạy được

Yêu cầu là: hai bảo đảm phải hiện ra như **hai loại khẳng định**, không phải hai trạng thái của
một thang. Cách thông thường — cấm bằng luật, rồi hy vọng — không có gì bảo đảm.

Cách dùng LAW-2 theo chiều dương: **chọn hai vị từ khác loại**, rồi để hình học tự khoá.

| bảo đảm | vị từ về | bằng chứng trên màn hình |
|---|---|---|
| read-your-writes | **một cặp** | quan hệ **TĨNH** giữa hai dấu — không gì chuyển động |
| eventual consistency | **điểm cuối** | **CHUYỂN ĐỘNG hoàn tất** — đầu mút tiền tố đi tới nơi |

Khác loại vị từ ⇒ khác **loại bằng chứng** ⇒ **không có thang nào để gộp chúng vào**. Việc gộp
không bị *cấm*; nó **bất khả**, vì một quan hệ tĩnh và một chuyển động hoàn tất không phải hai
giá trị của cùng một đại lượng.

Đo trên artifact:

```
read-your-writes:     đầu mút dịch   0px   (cần ≤3  — bằng chứng TĨNH)
eventual consistency: đầu mút dịch 184px   (cần ≥20 — bằng chứng CHUYỂN ĐỘNG)
negative control (hai bảo đảm dựng thành hai ĐÈN cùng hình): 0px · 0px → nổ đúng
```

**Negative control nổ đúng là phần quan trọng nhất.** Nó chứng minh cái "bất khả" đó **có
thật**, không chỉ được lập luận: khi hai bảo đảm được dựng bằng **cùng** một hình dạng bằng
chứng, phép kiểm phát hiện ngay. Bất khả-về-hình-học là một tính chất **đo được**.

## Nó phục vụ chức năng ngữ nghĩa nào

**Biến một điều cấm thành một điều bất khả.**

Một lệnh cấm (*"đừng gộp hai bảo đảm"*) sống trong tài liệu và phải được ai đó nhớ. Một bất khả
hình học sống trong artifact và **tự bảo vệ**: người dựng sau muốn gộp thì phải đổi loại vị từ
trước, và lúc đó phép kiểm nổ.

Đây là cùng họ với thứ đã học ở G01 — *"ghi lại một khuyết tật không ngăn được việc lặp lại nó;
chỉ một luật kiểm được mới ngăn"* — nhưng mạnh hơn một bậc: ở đây **không cần luật kiểm để ngăn**,
vì hình học đã không cho phép. Luật kiểm chỉ để xác nhận hình học đúng là như vậy.

## Khi nào KHÔNG được dùng lại

1. **Khi hai thứ cần trình bày THẬT SỰ cùng loại vị từ.** Ép chúng thành khác loại để lấy tính
   bất khả là bịa cấu trúc. Hai đại lượng cùng loại thì so được, và che điều đó là nói dối.
2. **Khi loại vị từ chỉ khác trên giấy.** Phải kiểm bằng negative control: dựng một bản mà cả
   hai dùng **cùng** hình dạng bằng chứng, và đòi phép kiểm nổ. Không có NC thì "khác loại"
   chỉ là một câu trong ghi chú.
3. **Khi một trong hai vị từ không có bằng chứng hình quan sát được.** Ở H01 cả hai đều có:
   một cái là *không có chuyển động*, cái kia là *có chuyển động tới đích*. Nếu một vế chỉ
   chứng minh được bằng nhãn chữ thì tính bất khả biến mất cùng với cái nhãn.
4. **Và tuyệt đối không** vì *"H01 làm thế và chạy tốt"*. LAW-2 chiều dương là một **cách chọn
   thiết bị**, không phải một thiết bị.
