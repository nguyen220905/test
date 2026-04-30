# Hướng dẫn cài đặt giọng Tiếng Việt

## ⚠️ Vấn đề

Windows mặc định **không có giọng tiếng Việt** cho Web Speech API. Vì vậy khi chọn "Tiếng Việt" trong ứng dụng, bạn sẽ không thấy giọng đọc tiếng Việt.

## ✅ Giải pháp

Có 3 cách để có giọng tiếng Việt:

---

## 🔧 Cách 1: Cài đặt giọng tiếng Việt trên Windows 11/10

### Bước 1: Mở Settings
1. Nhấn `Windows + I` để mở Settings
2. Tìm kiếm "**Speech**" hoặc "**Time & Language**"

### Bước 2: Thêm ngôn ngữ
1. Vào **Time & Language** > **Language & Region**
2. Click **Add a language**
3. Tìm và chọn "**Vietnamese (Tiếng Việt)**"
4. Click **Next** và **Install**

### Bước 3: Cài đặt Text-to-Speech
1. Sau khi cài xong ngôn ngữ, vào **Settings** > **Time & Language** > **Speech**
2. Trong phần **Manage voices**, tìm "**Vietnamese**"
3. Tải và cài đặt giọng đọc tiếng Việt (Microsoft An hoặc tương tự)

### Bước 4: Khởi động lại trình duyệt
1. Đóng hoàn toàn trình duyệt (Chrome/Edge)
2. Mở lại trình duyệt
3. Truy cập lại http://localhost:8000
4. Bây giờ bạn sẽ thấy giọng "**Microsoft An - Vietnamese (Vietnam)**" hoặc tương tự

---

## 🌐 Cách 2: Sử dụng API TTS chuyên nghiệp (Khuyến nghị)

Tôi đã tạo phiên bản mới sử dụng **FPT.AI Text-to-Speech API** - miễn phí 100,000 ký tự/tháng.

### Ưu điểm:
- ✅ Giọng đọc tiếng Việt tự nhiên, chất lượng cao
- ✅ Hỗ trợ giọng Bắc, Trung, Nam
- ✅ Nhiều giọng nam/nữ
- ✅ Miễn phí 100,000 ký tự/tháng
- ✅ Có thể tải xuống MP3

### Cách sử dụng:
Xem file `index-fpt.html` (đang tạo) để sử dụng phiên bản với FPT.AI TTS.

---

## 🎯 Cách 3: Sử dụng Chrome với Google Cloud TTS

### Cài đặt Extension
1. Cài extension **Read Aloud** hoặc **Natural Reader** từ Chrome Web Store
2. Extensions này hỗ trợ giọng tiếng Việt tốt hơn

---

## 📊 So sánh các phương pháp

| Phương pháp | Chất lượng | Miễn phí | Dễ cài | Offline |
|------------|-----------|---------|--------|---------|
| **Windows Voices** | ⭐⭐⭐ | ✅ | ⭐⭐ | ✅ |
| **FPT.AI API** | ⭐⭐⭐⭐⭐ | ✅ (100k chars) | ⭐⭐⭐ | ❌ |
| **Viettel AI API** | ⭐⭐⭐⭐⭐ | ✅ (50k chars) | ⭐⭐⭐ | ❌ |
| **Chrome Extension** | ⭐⭐⭐⭐ | ✅/💰 | ⭐⭐⭐⭐ | ❌ |

---

## 🚀 Khuyến nghị

Tôi khuyên bạn sử dụng **FPT.AI API** (Cách 2) vì:
- Giọng đọc tự nhiên nhất
- Miễn phí 100,000 ký tự/tháng (đủ dùng)
- Có thể tải xuống MP3
- Hỗ trợ nhiều giọng và vùng miền

Tôi đang tạo phiên bản mới sử dụng FPT.AI API ngay bây giờ!
