# VoiceStudio integration — discovered contract

Nguồn: `D:\Project\VoiceStudio` — **provider bên ngoài. CHỈ ĐỌC.** creative-video không sửa,
không refactor, không sao chép implementation của nó, và không dựng bản VoiceStudio thứ hai.

Mọi mục dưới đây gắn nhãn một trong hai:

- **`DISCOVERED_FROM_SOURCE`** — đọc được từ code/notebook của VoiceStudio.
- **`RUNTIME_VALUE_REQUIRED`** — chỉ tồn tại lúc chạy, người vận hành phải cung cấp.

## File đã đọc

| file | dùng để xác định |
|---|---|
| `notebooks/OmniVoice_Studio_Colab.ipynb` (37 cell) | cách deploy Colab, cách server khởi động, cách URL được expose, smoke test `/generate` |
| `backend/main.py` | `/health`, thứ tự middleware, `NetworkAccessMiddleware` |
| `backend/api/routers/generation.py` | chữ ký `POST /generate`, header response, cơ chế mất-chữ |
| `backend/api/dependencies.py` | gate consumption so với admin |
| `backend/core/auth.py` | `OMNIVOICE_API_KEY`, cách trích credential khỏi request |

---

## `DISCOVERED_FROM_SOURCE`

### Server khởi động thế nào

Notebook cell 6 (`── 5. Launch the backend`):

```
uvicorn main:app --app-dir backend --host 127.0.0.1 --port 3900
env: OMNIVOICE_SERVER_MODE=1
     OMNIVOICE_DATA_DIR=/content/omnivoice_data     # ephemeral trên Colab
```

`OMNIVOICE_SERVER_MODE=1` là quan trọng với người gọi: `backend/api/dependencies.py:249` ghi
*"In server mode this consumption gate is a no-op"*, nên `/generate` **không đòi credential**
theo mặc định.

### `GET /health`

| trạng thái | ý nghĩa |
|---|---|
| `200 {"status":"ok","device":"cuda (...)","version":...}` | sẵn sàng |
| `503 {"status":"starting","step":N,"label":...}` + `Retry-After: 2` | **đang khởi động, KHÔNG phải chết** |

Adapter phải phân biệt hai cái này — 503 ở đây là "chờ", không phải "hỏng".

### `POST /generate` — endpoint TTS

Content type: **form** (`Form(...)` của FastAPI). Notebook dùng
`application/x-www-form-urlencoded`; `multipart/form-data` cũng được và là bắt buộc nếu gửi
`ref_audio`.

Tham số liên quan tới người gọi (mặc định lấy từ chữ ký hàm, `generation.py:1107`):

| field | mặc định | ghi chú |
|---|---|---|
| `text` | *(bắt buộc)* | |
| `language` | `None` | |
| `speed` | `1.0` | đòn bẩy trực tiếp lên thời lượng |
| `seed` | `None` | **quyết định tính tái lập** |
| `engine` | `None` | |
| `profile_id` | `None` | voice profile đã lưu |
| `num_step` | `16` | |
| `guidance_scale` | `2.0` | |
| `effect_preset` | `"broadcast"` | |
| `max_chunk_chars` | `800` | text dài tự cắt ở ranh giới câu rồi crossfade; `0` = tắt |
| `crossfade_ms` | `50` | |
| `pronounce` | `true` | **áp từ điển phát âm của người dùng + override `[[…]]`** |
| `stream` | `false` | `true` → `application/x-ndjson` thay vì WAV |

### Response

`200`, body là **WAV nhị phân** (streamed theo chunk 16 KiB), kèm header:

| header | dùng làm gì |
|---|---|
| `X-Audio-Duration` | **thời lượng thật, giây** — đây là thứ Step 4.5 cần |
| `X-Gen-Time` | thời gian sinh |
| `X-Seed` | seed thực tế đã dùng |
| `X-Audio-Id`, `X-Audio-Path` | định danh take phía provider |
| `X-OmniVoice-Dropped-Chunks` | **có mặt = một phần text KHÔNG ra tiếng** |
| `X-OmniVoice-Dropped-Text` | phần chữ bị mất, đã cắt cho vừa header |

> `X-OmniVoice-Dropped-*` phải được adapter coi là **LỖI**, không phải cảnh báo. Mất chữ mà
> vẫn nhận WAV nghĩa là thời lượng đo được không còn ứng với narration — đúng loại hỏng âm
> thầm mà cả project này tồn tại để chặn.

Lỗi: HTTP status khác 2xx, body là JSON có `detail`.

### Auth

Không có credential nào theo mặc định. Hai cơ chế tuỳ chọn:

| cơ chế | bật khi nào | người gọi gửi gì |
|---|---|---|
| share PIN | vận hành viên đặt PIN trong Settings | header `x-omnivoice-pin` (hoặc `?pin=`, cookie `ov_pin`) — chỉ áp cho client **không phải loopback** |
| API key | env `OMNIVOICE_API_KEY` | `Authorization: Bearer <key>` (hoặc `?api_key=`) |

`NetworkAccessMiddleware` (`main.py:1436`) **trơ khi không có PIN**, nên qua tunnel mà không đặt
PIN thì gọi được không cần gì.

### Phát âm — vì sao KHÔNG cần tách tts-input

`pronounce` mặc định `true`, và provider đã có sẵn từ điển phát âm của người dùng cộng override
nội tuyến `[[…]]` (`generation.py`, Expressive-TTS Spec 01; có router `pronunciation.py` riêng).

→ **Không tạo `tts-input.txt` / `pronunciation-map.yaml`.** Chuẩn hoá phát âm là việc của
provider, và dựng một lớp thứ hai ở creative-video sẽ là bản sao thứ hai của một thứ đã tồn tại.
Narration chuẩn đi thẳng vào `text`. Nếu sau này thật sự cần, cách đúng là dùng từ điển của
VoiceStudio, không phải viết lại narration.

---

## `RUNTIME_VALUE_REQUIRED`

### URL công khai — **hiện chưa có, và không được bịa**

Notebook cell 7 mặc định dùng:

```python
from google.colab import output
output.serve_kernel_port_as_window(3900)
```

Đó là **kernel port proxy của Colab: chỉ trình duyệt bạn, xác thực bằng phiên Google.** Nó
**không** phải một API URL mà máy này gọi được.

Notebook nêu cách lấy URL công khai, dưới dạng tuỳ chọn, trong comment của chính cell 7:

```
!cloudflared tunnel --url http://127.0.0.1:3900 --no-autoupdate &
!grep -o "https://.*trycloudflare.com" /content/cloudflared.log | head -1
```

→ Cần chạy cell đó rồi đưa URL `https://….trycloudflare.com` cho adapter.

### Cấu hình adapter đọc từ môi trường

| biến | bắt buộc | |
|---|---|---|
| `VOICESTUDIO_URL` | **có** | base URL, ví dụ `https://xxx.trycloudflare.com`. Không hardcode. |
| `VOICESTUDIO_PIN` | không | chỉ khi vận hành viên đặt share PIN |
| `VOICESTUDIO_API_KEY` | không | chỉ khi `OMNIVOICE_API_KEY` được đặt phía server |

Không commit URL tạm, PIN hay key vào source. URL Colab đổi sau mỗi lần restart runtime.

---

## Giả định vận hành

1. **Colab phải được bật tay.** Runtime tắt là trạng thái bình thường, không phải lỗi
   implementation. Adapter phân biệt `VOICE_PROVIDER_UNREACHABLE` với
   `VOICE_GENERATION_FAILED`.
2. **Sinh là đồng bộ.** `stream=false` giữ nguyên request cho tới khi WAV xong. Notebook đặt
   timeout 1800s cho smoke test; lần sinh đầu tiên còn phải nạp (và có thể tải) model.
3. **Lưu trữ Colab là tạm.** `OMNIVOICE_DATA_DIR=/content/omnivoice_data` mất khi runtime chết.
   creative-video vì thế phải giữ **bản WAV của chính nó**, không dựa vào `X-Audio-Path`.
4. **Không có GPU thì rất chậm.** `/health.device` báo `cpu` là dấu hiệu; đó là chuyện vận
   hành, không phải lỗi.
5. **Text dài tự cắt** ở `max_chunk_chars=800` và crossfade. Narration F01 dài hơn thế nhiều
   nên đường này chắc chắn được dùng — và cũng là lý do `X-OmniVoice-Dropped-*` phải bị coi là
   lỗi.

## Khiếm khuyết phát hiện trong VoiceStudio

Không có. Không sửa gì trong repo đó.

---

## Một video, một giọng — và vì sao phải hỏi lại provider

`POST /generate` trả về seed, thời lượng, audio id — **không trả về giọng đã dùng**. Không
header nào nói `profile_id`.

Điều đó sẽ vô hại nếu một `profile_id` lạ bị từ chối. Nó không bị từ chối:

```python
# backend/api/routers/generation.py:1312
if profile_id:
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM voice_profiles WHERE id=?", (profile_id,)).fetchone()
    if row:
        resolved_profile_id = profile_id
        ...
```

Không có `else`. Id không khớp dòng nào thì `resolved_profile_id` ở lại `None`, generation
chạy tiếp bằng **giọng mặc định**, và trả **HTTP 200 kèm WAV nghe được**. Một lỗi gõ trong
`profile_id` không hiện ra ở đâu cả — nó hiện ra ở video đổi giọng giữa chừng, với mọi
segment đều báo thành công.

Nên echo lại `profile_id` mà mình vừa gửi thì **không xác minh được gì**. Bằng chứng độc lập
duy nhất là bản ghi của chính provider:

| bước | căn cứ |
|---|---|
| `X-Audio-Id` **là** `generation_history.id` | `generation.py:890` sinh `audio_id`, `:904` insert nó làm khoá chính |
| dòng history mang `profile_id` đã thật sự điều kiện hoá giọng | `generation.py:904`, cột thứ sáu là `resolved_profile_id` |
| đọc lại bằng `GET /history` | `generation.py:2205` — 50 bản mới nhất cộng mọi bản được đánh sao |

`GET /profiles` liệt kê mọi profile (`id` và `name`); `GET /profiles/{id}` trả **404** khi id
không tồn tại — đó là cách chốt profile TRƯỚC khi sinh giây audio nào.

### Cách creative-video dùng

1. `voice_calibration.profile_id` trong `shot_plan.yaml` của video. Không đặt ở env, không
   đặt trong source: đây là quyết định về narration này, video khác phải chọn lại.
2. `cv voice generate` giải `profile_id` thành **một id cụ thể** trước khi sinh — thử như id,
   nếu 404 thì tra theo `name` và chỉ chấp nhận khi khớp đúng một dòng. Trùng tên → từ chối
   và bắt ghim id.
3. Sau **từng** segment: `GET /history`, tìm dòng có `id === X-Audio-Id`, so `profile_id` với
   id đã chốt. Lệch → dừng. Không có dòng history → cũng dừng: history được ghi kiểu
   best-effort, và "không xác minh được" khác "sai giọng" nhưng cả hai đều phải chặn một lượt
   chạy đã hứa một giọng.
4. Trước khi ghép: kiểm lại cả tập, phải đúng một giá trị `profile_id`.
5. `VOICE_PROVENANCE.yaml` ghi `profile_id` **đã xác minh** cho từng segment kèm `audio_id`,
   không phải giá trị đã gửi đi.

Không có bước nào ghép trước rồi kiểm sau. File ghép là lời khẳng định "một giọng từ đầu tới
cuối", nên nó chỉ được tạo ra sau khi lời khẳng định đó đã được kiểm.
