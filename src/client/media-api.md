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
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/your/file.jpg" \
  -F "file_key=custom-filename"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://s3-website-r1.s3cloud.vn/hsa/2025-07-05/1720185600000.jpg"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

**Lưu ý:**
- File size tối đa: 10MB
- Định dạng hỗ trợ: jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, txt
- `file_key` là tùy chọn, nếu không cung cấp sẽ tự động tạo tên file

---

## 2. Lấy danh sách files

**Endpoint:** `GET /media/files`

**Request:**
```bash
curl -X GET http://localhost:8080/media/files \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Files retrieved successfully",
  "data": [
    {
      "key": "2025-07-05/1720185600000.jpg",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/2025-07-05/1720185600000.jpg",
      "size": 1024000,
      "last_modified": "2025-07-05T10:00:00Z"
    },
    {
      "key": "2025-07-05/1720185700000.pdf",
      "url": "https://s3-website-r1.s3cloud.vn/hsa/2025-07-05/1720185700000.pdf",
      "size": 2048000,
      "last_modified": "2025-07-05T10:05:00Z"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 3. Xóa file

**Endpoint:** `DELETE /media/:fileKey`

**Request:**
```bash
curl -X DELETE http://localhost:8080/media/2025-07-05/1720185600000.jpg \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "File deleted successfully",
  "data": {
    "deleted_key": "2025-07-05/1720185600000.jpg"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## Ví dụ sử dụng hoàn chỉnh

### Bước 1: Đăng nhập để lấy token
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
  }'
```

### Bước 2: Upload file
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <token_from_step_1>" \
  -F "file=@./example.jpg"
```

### Bước 3: Lấy danh sách files
```bash
curl -X GET http://localhost:8080/media/files \
  -H "Authorization: Bearer <token_from_step_1>"
```

### Bước 4: Xóa file (nếu cần)
```bash
curl -X DELETE http://localhost:8080/media/2025-07-05/1720185600000.jpg \
  -H "Authorization: Bearer <token_from_step_1>"
```

---

## Cấu hình S3

Hệ thống sử dụng S3 Cloud VN với cấu hình:
- **Endpoint:** https://s3-website-r1.s3cloud.vn
- **Bucket:** hsa
- **Region:** hcm
- **Access Control:** public-read

---

## Lỗi thường gặp

### 401 Unauthorized
```json
{
  "status_code": 401,
  "message": "Unauthorized",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** Kiểm tra token và đăng nhập lại

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
**Giải pháp:** Chỉ upload các định dạng được hỗ trợ

### 400 Bad Request - Lỗi S3
```json
{
  "status_code": 400,
  "message": "Lỗi upload file: AccessDenied",
  "timestamp": "2025-07-05T10:00:00Z"
}
```
**Giải pháp:** Liên hệ admin để kiểm tra cấu hình S3 