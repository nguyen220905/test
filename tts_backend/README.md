# Vietnamese TTS — Backend (FastAPI)

## Cấu trúc dự án

```
tts_backend/
├── main.py               ← Entry point, chạy file này
├── config.py             ← Cấu hình (đọc từ .env)
├── database.py           ← SQLite + SQLAlchemy
├── models.py             ← Pydantic schemas
├── routers/
│   ├── tts.py            ← /api/tts, /api/tts/stream, /api/tts/upload-file
│   └── history.py        ← /api/history
├── services/
│   ├── ai_service.py     ← Gọi AI API (ngrok)
│   └── audio_utils.py    ← Chỉnh âm lượng WAV
├── audio_files/          ← File WAV lưu ở đây (tự tạo khi chạy)
├── .env.example          ← Mẫu cấu hình
├── requirements.txt
└── README.md
```

---

## Cài đặt

```bash
# 1. Tạo virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Cài thư viện
pip install -r requirements.txt

# 3. Tạo file .env từ mẫu
cp .env.example .env
```

Mở `.env` và điền:
- `AI_API_URL` — link ngrok bạn AI gửi (ví dụ: `https://abcd1234.ngrok-free.app`)
- `AI_API_KEY` — API key bạn AI cung cấp

---

## Chạy server

```bash
# Cách 1 (khuyến nghị): chạy trực tiếp, port 8888 mặc định
python main.py

# Cách 2: dùng uvicorn
uvicorn main:app --reload --port 8888
```

> Backend sẽ phục vụ luôn cả frontend tĩnh từ `../tayvoice-frontv2/tayvoice/`.
> Mở http://localhost:8888/ → tự động vào trang giao diện.

- API docs: http://localhost:8888/docs
- Health check: http://localhost:8888/api/health

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Thông tin server |
| GET | `/api/health` | Kiểm tra backend + AI API |
| POST | `/api/tts` | Chuyển text → audio (lưu file) |
| POST | `/api/tts/stream` | Stream audio trực tiếp (không lưu) |
| POST | `/api/tts/upload-file` | Upload .txt → trả về nội dung |
| GET | `/api/history` | Lấy lịch sử (`?skip=0&limit=50`) |
| DELETE | `/api/history/{id}` | Xóa một bản ghi |
| DELETE | `/api/history/` | Xóa tất cả lịch sử |
| GET | `/audio/{filename}` | Phát file WAV đã lưu |

---

## Cách frontend gọi

### Chuyển đổi text

```js
const res = await fetch("http://localhost:8888/api/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Xin chào Việt Nam",
    noise_scale: 0.667,   // cao độ (0–2)
    length_scale: 1.0,    // tốc độ (0.5=nhanh, 2=chậm)
    volume: 1.0,          // âm lượng (0.1–3.0)
    save_audio: true,     // có lưu file không
  }),
});
const data = await res.json();
// data.audio_url = "/audio/abc123.wav"
const audio = new Audio("http://localhost:8888" + data.audio_url);
audio.play();
```

### Upload file .txt

```js
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("http://localhost:8888/api/tts/upload-file", {
  method: "POST",
  body: formData,
});
const { text } = await res.json();
// Dùng text này gọi /api/tts tiếp theo
```

### Lịch sử

```js
const res = await fetch("http://localhost:8888/api/history/");
const history = await res.json();
// history = [{id, text, audio_url, noise_scale, length_scale, volume, created_at}, ...]
```

### Play / Pause / Stop (client-side)

```js
let audio = null;

function play(url) {
  audio = new Audio(url);
  audio.play();
}

function pause() { audio?.pause(); }
function resume() { audio?.play(); }
function stop() {
  audio?.pause();
  if (audio) audio.currentTime = 0;
}
```

> Play/Pause/Stop không cần backend — dùng Web Audio API hoặc HTML Audio element trực tiếp.

---

## Mapping thông số

| Frontend | Backend field | AI API field | Ghi chú |
|----------|--------------|--------------|---------|
| Tốc độ | `length_scale` | `length_scale` | 0.5=nhanh, 1=bình thường, 2=chậm |
| Cao độ | `noise_scale` | `noise_scale` | 0–2, ảnh hưởng biến thể giọng |
| Âm lượng | `volume` | *(xử lý tại backend)* | Backend chỉnh WAV trước khi trả |
