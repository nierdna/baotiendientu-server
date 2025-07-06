# API Documentation for Media Management

## Credentials
- **Email:** `admin@baotiendientu.com`
- **Password:** `Admin123!`

---

## 1. Upload File

**Endpoint:** `POST /media/upload`

**Request:**
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://i.ibb.co/abc123/image.jpg",
    "display_url": "https://i.ibb.co/abc123/image.jpg"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

**Lưu ý:**
- File size tối đa: 10MB
- Định dạng hỗ trợ: jpg, jpeg, png, gif, webp
- File được lưu trữ trên imgbb.com (miễn phí)
- Không cần authentication cho upload file
- File được lưu hoàn toàn trên RAM, không lưu ra disk

---

## 2. Test Upload (Debug)

**Endpoint:** `POST /test-upload`

**Request:**
```bash
curl -X POST http://localhost:8080/test-upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

**Response:**
```json
{
  "message": "Upload thành công",
  "originalname": "image.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "bufferLength": 1024000
}
```

**Mục đích:** Test upload file để kiểm tra buffer và thông tin file

---

## Ví dụ sử dụng hoàn chỉnh

### Bước 1: Upload file ảnh
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./example.jpg"
```

### Bước 2: Test upload (debug)
```bash
curl -X POST http://localhost:8080/test-upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./example.jpg"
```

---

## Cấu hình ImgBB

Hệ thống sử dụng ImgBB.com với cấu hình:
- **API URL:** https://api.imgbb.com/1/upload
- **API Key:** Được cấu hình trong environment variables
- **Storage:** Hoàn toàn trên RAM (memoryStorage)
- **Auto Cleanup:** Không lưu file tạm trên disk

---

## Lỗi thường gặp

### 400 Bad Request - File buffer lỗi hoặc rỗng
```json
{
  "status_code": 400,
  "message": "Lỗi upload file: File buffer lỗi hoặc rỗng",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** 
- Kiểm tra file có hợp lệ không
- Đảm bảo file là ảnh (jpg, png, gif, webp)
- Thử với file khác

### 400 Bad Request - File quá lớn
```json
{
  "status_code": 400,
  "message": "File size exceeds maximum limit of 10MB",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** Nén file hoặc chọn file nhỏ hơn

### 400 Bad Request - Định dạng không hỗ trợ
```json
{
  "status_code": 400,
  "message": "File type not supported",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** Chỉ upload các định dạng được hỗ trợ (jpg, jpeg, png, gif, webp)

### 400 Bad Request - Lỗi ImgBB
```json
{
  "status_code": 400,
  "message": "Lỗi upload file: Invalid API key",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** Liên hệ admin để kiểm tra cấu hình ImgBB API key

---

## Ưu điểm của ImgBB

1. **Miễn phí:** Không cần trả phí cho upload ảnh
2. **Đơn giản:** Không cần cấu hình phức tạp
3. **Nhanh:** Upload và lấy URL ngay lập tức
4. **Bảo mật:** File được lưu hoàn toàn trên RAM, không lưu ra disk
5. **CDN:** ImgBB có CDN toàn cầu, load ảnh nhanh

---

## Giới hạn ImgBB Free

- **File size:** Tối đa 32MB
- **Uploads:** Không giới hạn số lượng
- **Lưu trữ:** Vĩnh viễn (không bị xóa)
- **Bandwidth:** Không giới hạn
- **API calls:** Không giới hạn

---

## Cấu hình Environment Variables

```bash
# .env file
IMGBB_API_KEY=your_imgbb_api_key_here
IMGBB_API_URL=https://api.imgbb.com/1/upload
```

**Lưu ý:** API key được cấu hình sẵn trong code, nhưng nên chuyển sang environment variables cho bảo mật. 