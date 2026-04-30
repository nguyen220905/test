# 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG TTS

## ⚠️ Vấn đề hiện tại
- ResponsiveVoice API không load được (bị chặn hoặc không có internet)
- Web Speech API không có giọng tiếng Việt trên Windows

## ✅ GIẢI PHÁP: Sử dụng Python Backend (Khuyến nghị)

### Bước 1: Cài đặt Python dependencies

Mở PowerShell/CMD trong thư mục project và chạy:
```bash
pip install -r requirements.txt
```

Hoặc cài từng package:
```bash
pip install flask flask-cors gTTS
```

### Bước 2: Chạy Python server

```bash
python server.py
```

Server sẽ chạy tại: **http://localhost:5000**

### Bước 3: Mở ứng dụng

Trong terminal khác, chạy web server (hoặc dùng server đang chạy):
```bash
python -m http.server 8000
```

Sau đó mở trình duyệt:
```
http://localhost:8000/index-python.html
```

---

## 🎯 Hướng dẫn sử dụng

1. **Nhập văn bản** hoặc click "Văn bản mẫu"
2. **Chọn ngôn ngữ** (mặc định: Tiếng Việt)
3. **Điều chỉnh tốc độ** (nếu cần)
4. Click "**Phát giọng nói**"
5. Đợi 1-2 giây để tạo file MP3
6. Nghe giọng đọc!
7. Click "**Tải xuống MP3**" để lưu file

---

## ✨ Ưu điểm của phiên bản Python

- ✅ **Giọng tiếng Việt chất lượng cao** (Google TTS)
- ✅ **Hoàn toàn miễn phí**, không giới hạn
- ✅ **Tải xuống MP3** thực sự
- ✅ **Không cần internet** sau khi tải package
- ✅ **Không bị chặn** bởi AdBlock/Firewall
- ✅ **Chạy 100% local**

---

## 📊 So sánh các phiên bản

| Phiên bản | Giọng Việt | Internet | Tải MP3 | Độ phức tạp |
|-----------|-----------|----------|---------|-------------|
| **index-python.html** | ✅ Có | ⚠️ Cần (lần đầu) | ✅ Có | ⭐⭐ |
| **index-vietnamese.html** | ❌ Lỗi | ✅ Cần | ❌ Không | ⭐ |
| **index.html** | ❌ Không | ❌ Không cần | ❌ Không | ⭐ |

---

## 🐛 Troubleshooting

### Lỗi: "ModuleNotFoundError: No module named 'flask'"
**Giải pháp**: Chạy `pip install -r requirements.txt`

### Lỗi: "Không kết nối được server"
**Giải pháp**: 
1. Kiểm tra server.py đã chạy chưa?
2. Xem console có lỗi gì không?
3. Thử restart server.py

### Lỗi: "Failed to fetch"
**Giải pháp**:
1. Kiểm tra CORS (đã enable trong server.py)
2. Đảm bảo server chạy port 5000
3. Thử reload trang

---

## 🎉 Kết luận

**Khuyến nghị sử dụng: index-python.html**

Lý do:
- Giọng tiếng Việt tốt nhất
- Tải xuống MP3 thực sự
- Không phụ thuộc external API
- Chạy hoàn toàn local

---

**Happy TTS! 🎤🇻🇳**
