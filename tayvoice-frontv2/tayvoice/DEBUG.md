# 🐛 HƯỚNG DẪN DEBUG - TTS APPLICATION

## 🔍 Lỗi hiện tại
```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## ✅ CÁC BƯỚC SỬA LỖI

### Bước 1: Kiểm tra Server đang chạy

**Mở test page:**
```
http://localhost:8000/test-api.html
```

Trang này sẽ tự động test:
- ✅ Health Check API
- ✅ Get Voices API  
- ✅ TTS Conversion API

### Bước 2: Xem kết quả test

Nếu **tất cả đều PASS** → Server OK, vấn đề ở frontend
Nếu **có lỗi** → Đọc error message để debug

### Bước 3: Kiểm tra Console

**Trong index-python.html:**
1. Nhấn F12 để mở DevTools
2. Vào tab Console
3. Xem lỗi gì xuất hiện
4. Vào tab Network
5. Xem request nào bị fail

---

## 🔧 CÁC NGUYÊN NHÂN PHỔ BIẾN

### 1. Server không chạy
**Triệu chứng**: `net::ERR_CONNECTION_REFUSED`
**Giải pháp**: 
```bash
python server.py
```

### 2. CORS Error
**Triệu chứng**: `CORS policy: No 'Access-Control-Allow-Origin'`
**Giải pháp**: Đã fix trong server.py (CORS enabled)

### 3. Port bị chiếm
**Triệu chứng**: `Address already in use`
**Giải pháp**:
```bash
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F  

# Restart server
python server.py
```

### 4. Module không tìm thấy
**Triệu chứng**: `ModuleNotFoundError: No module named 'flask'`
**Giải pháp**:
```bash
pip install -r requirements.txt
```

---

## 📊 KIỂM TRA TỪNG API

### API 1: Health Check
```bash
curl http://localhost:5000/api/health
```
**Kết quả mong đợi**:
```json
{"service":"TAYVOICE TTS API","status":"ok"}
```

### API 2: Get Voices
```bash
curl http://localhost:5000/api/voices
```
**Kết quả mong đợi**:
```json
{
  "voices": [
    {"code":"vi","lang":"Vietnamese","name":"Tiếng Việt"},
    ...
  ]
}
```

### API 3: Text-to-Speech
```bash
curl -X POST http://localhost:5000/api/tts ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Xin chào\",\"lang\":\"vi\"}"
```
**Kết quả mong đợi**:
```json
{
  "audio_url":"/api/audio/xxx.mp3",
  "filename":"xxx.mp3",
  "success":true
}
```

---

## 🎯 GIẢI PHÁP NHANH

### Nếu vẫn lỗi, thử các bước sau:

1. **Restart cả 2 server:**
```bash
# Terminal 1: Dừng web server (Ctrl+C), sau đó:
python -m http.server 8000

# Terminal 2: Dừng Python server (Ctrl+C), sau đó:
python server.py
```

2. **Clear browser cache:**
   - Nhấn `Ctrl + Shift + Delete`
   - Chọn "Cached images and files"
   - Click "Clear data"

3. **Thử trình duyệt khác:**
   - Edge
   - Chrome
   - Firefox

4. **Kiểm tra Firewall/Antivirus:**
   - Tạm thời tắt để test
   - Nếu OK → Add exception cho Python

---

## 🚀 PHIÊN BẢN ĐƠN GIẢN HƠN (Backup)

Nếu Python backend vẫn không hoạt động, bạn có thể:

### Option 1: Cài giọng tiếng Việt cho Windows
Xem file: `VIETNAMESE_VOICE_GUIDE.md`

### Option 2: Dùng online service
Truy cập: https://voicemaker.in hoặc https://ttstool.com

---

## 📞 THÔNG TIN QUAN TRỌNG

**Servers đang chạy:**
- ✅ Web Server: http://localhost:8000
- ✅ Python API: http://localhost:5000

**Files cần mở:**
- ❌ KHÔNG: http://localhost:8000/ (index.html)
- ❌ KHÔNG: http://localhost:8000/index-vietnamese.html
- ✅ MỞ: http://localhost:8000/index-python.html
- ✅ MỞ: http://localhost:8000/test-api.html (để test)

---

## 💡 Tips

1. **Luôn kiểm tra cả 2 terminals** có lỗi gì không
2. **Xem Network tab** trong DevTools để debug
3. **Test API trước** bằng test-api.html
4. **Nếu API OK** nhưng app lỗi → Vấn đề ở frontend

---

**Hãy thử test-api.html trước để xác định vấn đề!** 🔍
