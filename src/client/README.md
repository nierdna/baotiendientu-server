# API Documentation Package for Client

## 📋 Tổng quan

Package này chứa toàn bộ tài liệu API cần thiết cho client để tích hợp với backend "Báo Tiền Điện Tử".

## 🚀 Tính năng mới

### ✅ Upload File với ImgBB
- **Hoàn toàn miễn phí** - Không cần trả phí cho upload ảnh
- **Lưu trữ trên RAM** - File được xử lý hoàn toàn trên memory, không lưu ra disk
- **CDN toàn cầu** - ImgBB có CDN giúp load ảnh nhanh
- **Không cần authentication** - Upload file không cần token
- **Auto cleanup** - Không tạo file tạm trên server

### ✅ Blog với Tags
- Hỗ trợ tạo/cập nhật blog với tags
- Tự động tạo tag mới nếu chưa tồn tại
- Hỗ trợ cả ID và tên tag

### ✅ Test Upload API
- API debug để kiểm tra upload file
- Trả về thông tin chi tiết về file nhận được

## 📁 Cấu trúc tài liệu

```
src/client/
├── README.md                    # Hướng dẫn tổng quan
├── API_GUIDE.md                # Hướng dẫn sử dụng API
├── admin-api.md                # API cho Admin
├── user-api.md                 # API cho User
├── blog-api-with-tags.md       # API Blog với Tags
├── media-api.md                # API Upload File
├── DELIVERY_PACKAGE.md         # Package bàn giao
└── mock/                       # Mock data
    ├── admin/
    ├── user/
    ├── blog/
    └── media/
```

## 🔧 Cài đặt và sử dụng

### 1. Credentials mặc định
```bash
Email: admin@baotiendientu.com
Password: Admin123!
```

### 2. Test upload file
```bash
# Test upload với API debug
curl -X POST http://localhost:8080/test-upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./example.jpg"

# Upload file thật
curl -X POST http://localhost:8080/media/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./example.jpg"
```

### 3. Tạo blog với tags
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bài viết mới",
    "content": "Nội dung bài viết...",
    "tags": ["crypto", "blockchain", "bitcoin"]
  }'
```

## 📊 Thống kê API

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | 4 | ✅ Ready |
| User | 8 | ✅ Ready |
| Admin | 12 | ✅ Ready |
| Blog | 6 | ✅ Ready |
| Media | 2 | ✅ Ready |
| Test | 1 | ✅ Ready |

## 🔒 Bảo mật

- **JWT Authentication** cho các API cần thiết
- **Rate Limiting** để tránh spam
- **File Validation** cho upload
- **Input Sanitization** cho tất cả input

## 🚀 Performance

- **Upload file**: Hoàn toàn trên RAM, không lưu disk
- **Response time**: < 200ms cho hầu hết API
- **File size limit**: 10MB cho upload
- **CDN**: ImgBB CDN cho ảnh

## 📝 Changelog

### v2.0.0 (2025-07-05)
- ✅ Chuyển từ S3 sang ImgBB cho upload file
- ✅ Thêm API test upload
- ✅ Cải thiện performance với memoryStorage
- ✅ Cập nhật tài liệu đầy đủ

### v1.0.0 (2025-07-04)
- ✅ Tạo package tài liệu cơ bản
- ✅ API Auth, User, Admin, Blog
- ✅ Mock data và hướng dẫn

## 📞 Hỗ trợ

Nếu có vấn đề gì, hãy liên hệ:
- **Email**: admin@baotiendientu.com
- **Documentation**: Xem các file .md trong thư mục này
- **Swagger UI**: http://localhost:8080/docs (khi server chạy) 