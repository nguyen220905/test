# TAYVOICE TTS Clone - Phiên bản Tiếng Việt 🇻🇳

## 🎉 CẬP NHẬT MỚI!

Đã tạo **phiên bản mới với giọng Tiếng Việt chất lượng cao**!

---

## 📂 Các phiên bản

### 1. **index.html** - Phiên bản Web Speech API (Gốc)
- Sử dụng Web Speech API của trình duyệt
- ⚠️ **Không có giọng tiếng Việt trên Windows** (cần cài đặt thêm)
- Hoạt động offline
- Miễn phí hoàn toàn

### 2. **index-vietnamese.html** - Phiên bản Tiếng Việt (Khuyến nghị) ⭐
- ✅ Sử dụng ResponsiveVoice API
- ✅ **CÓ SẴN giọng tiếng Việt chất lượng cao**
- ✅ Giọng tự nhiên, dễ nghe
- ✅ Hỗ trợ giọng Nam/Nữ
- ✅ Thêm nút **Tạm dừng** và **Văn bản mẫu**
- ✅ Điều chỉnh **Âm lượng**
- ⚠️ Cần kết nối internet
- 💰 Miễn phí cho mục đích phi thương mại

---

## 🚀 Cách sử dụng phiên bản Tiếng Việt

### Bước 1: Mở phiên bản Tiếng Việt
Truy cập: **http://localhost:8000/index-vietnamese.html**

### Bước 2: Sử dụng
1. **Nhập văn bản** hoặc click "**Văn bản mẫu**" để load text tiếng Việt
2. **Chọn giọng**: Giọng Nữ hoặc Giọng Nam
3. **Điều chỉnh**: Tốc độ, Cao độ, Âm lượng
4. Click "**Phát giọng nói**" (hoặc nhấn `Ctrl + Enter`)
5. Sử dụng "**Tạm dừng**" nếu muốn pause
6. Click "**Dừng**" để dừng hẳn

---

## ✨ Tính năng phiên bản Tiếng Việt

### So với phiên bản gốc, thêm:
- ✅ **Giọng tiếng Việt sẵn có** (không cần cài đặt)
- ✅ **Nút Tạm dừng/Tiếp tục**
- ✅ **Nút Văn bản mẫu** (5 câu tiếng Việt)
- ✅ **Điều khiển Âm lượng**
- ✅ **Alert banner** hướng dẫn
- ✅ **Giọng tự nhiên hơn**

### Phím tắt
- `Ctrl + Enter`: Phát giọng nói
- `Ctrl + Space`: Tạm dừng/Tiếp tục
- `Esc`: Dừng

---

## 📊 So sánh 2 phiên bản

| Tính năng | index.html | index-vietnamese.html |
|-----------|-----------|---------------------|
| **Giọng Tiếng Việt** | ❌ (cần cài) | ✅ Sẵn có |
| **Chất lượng giọng** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Internet** | ❌ Không cần | ✅ Cần |
| **Miễn phí** | ✅ 100% | ✅ Phi thương mại |
| **Tạm dừng** | ❌ | ✅ |
| **Văn bản mẫu** | ❌ | ✅ |
| **Âm lượng** | ❌ | ✅ |
| **Số giọng** | Ít (tùy OS) | 2 (Nam/Nữ) |

---

## 🎯 Khuyến nghị sử dụng

### Dùng **index-vietnamese.html** nếu:
- ✅ Bạn có kết nối internet
- ✅ Bạn cần giọng tiếng Việt ngay lập tức
- ✅ Bạn muốn chất lượng giọng tốt nhất
- ✅ Bạn sử dụng cho mục đích cá nhân

### Dùng **index.html** nếu:
- ✅ Bạn đã cài giọng tiếng Việt trên Windows
- ✅ Bạn cần hoạt động offline
- ✅ Bạn muốn tốc độ nhanh hơn (không qua API)

---

## � Hướng dẫn cài giọng tiếng Việt cho Windows

Nếu muốn dùng **index.html** với giọng tiếng Việt, xem file:
👉 [VIETNAMESE_VOICE_GUIDE.md](VIETNAMESE_VOICE_GUIDE.md)

---

## 🌐 URLs

**Phiên bản gốc:**
```
http://localhost:8000/index.html
```

**Phiên bản Tiếng Việt (Khuyến nghị):**
```
http://localhost:8000/index-vietnamese.html
```

---

## � Screenshots

### Phiên bản Tiếng Việt
![Vietnamese Version](docs/screenshot-vietnamese.png)

Đặc điểm:
- Alert banner màu xanh lá
- Badge "Vietnamese Voices" và "Free"
- Nút "Văn bản mẫu"
- Nút "Tạm dừng"
- Slider âm lượng
- Văn bản mẫu tiếng Việt

---

## � Xử lý lỗi

### Lỗi: "ResponsiveVoice chưa được tải"
**Nguyên nhân**: Không có internet hoặc bị chặn script

**Giải pháp**:
1. Kiểm tra kết nối internet
2. Tắt AdBlock/uBlock
3. Reload trang (F5)
4. Nếu vẫn lỗi, dùng phiên bản **index.html**

---

## 📝 Notes

- ResponsiveVoice API key `jQZ2zCiM` là key miễn phí cho non-commercial use
- Giọng được xử lý trên cloud của ResponsiveVoice
- Latency ~ 1-2 giây khi bắt đầu phát
- Chất lượng giọng phụ thuộc vào kết nối internet

---

## 🚀 Bắt đầu ngay

1. **Mở terminal** và chạy server (nếu chưa chạy):
```bash
cd C:\Users\ADMIN\.gemini\antigravity\scratch\j2team-tts-clone
python -m http.server 8000
```

2. **Mở trình duyệt** và truy cập:
```
http://localhost:8000/index-vietnamese.html
```

3. **Thử ngay** bằng cách:
   - Click nút "Văn bản mẫu"
   - Sau đó click "Phát giọng nói"
   - Nghe giọng tiếng Việt tự nhiên! 🎉

---

## � Support

Nếu gặp vấn đề, kiểm tra:
1. Console log (`F12` → Console)
2. Network tab (`F12` → Network)
3. Đảm bảo không có AdBlock chặn ResponsiveVoice

---

**Enjoy Vietnamese TTS! 🇻🇳🎉**
