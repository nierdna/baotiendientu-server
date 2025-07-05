# 📦 Backend API Package for Frontend Team

## 🎯 Tổng quan

Package này chứa toàn bộ tài liệu API và mock data cần thiết cho frontend team để tích hợp với backend Báo Tiền Điện Tử.

---

## 📁 Cấu trúc Package

```
@/client/
├── README.md                    # Hướng dẫn tổng quan
├── API_GUIDE.md                # Hướng dẫn sử dụng API
├── admin-api.md                # API quản lý hệ thống (Admin)
├── user-api.md                 # API nghiệp vụ người dùng (User)
├── media-api.md                # API upload file (Admin)
├── blog-api-with-tags.md       # API blog với tags (Admin)
├── mock/                       # Mock data cho development
│   ├── login-success.json
│   ├── blog-list.json
│   ├── blog-with-tags.json
│   ├── user-detail.json
│   ├── category-list.json
│   ├── tags-list.json
│   ├── comment-list.json
│   ├── like-response.json
│   ├── media-upload-success.json
│   ├── media-files-list.json
│   ├── media-delete-success.json
│   ├── health-check.json
│   ├── error-401.json
│   ├── error-403.json
│   ├── error-404.json
│   ├── error-400.json
│   ├── error-file-too-large.json
│   └── error-invalid-file-type.json
└── DELIVERY_PACKAGE.md         # File này
```

---

## 🚀 Quick Start

### 1. **Đăng nhập để lấy token:**
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
  }'
```

### 2. **Test API cơ bản:**
```bash
# Health check
curl http://localhost:8080/health

# Lấy danh sách tags
curl http://localhost:8080/tags

# Upload ảnh
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./example.jpg"
```

---

## 📋 API Endpoints Chính

### **Authentication**
- `POST /users/login` - Đăng nhập
- `GET /users/verify` - Xác thực token

### **Blog Management**
- `GET /blogs` - Lấy danh sách bài viết
- `POST /blogs` - Tạo bài viết mới (với tags)
- `PUT /blogs/:id` - Cập nhật bài viết
- `GET /blogs/:id` - Chi tiết bài viết

### **Tag Management**
- `GET /tags` - Lấy danh sách tags
- `POST /tags` - Tạo tag mới

### **Media Upload**
- `POST /media/upload` - Upload file
- `GET /media/files` - Lấy danh sách files
- `DELETE /media/:fileKey` - Xóa file

### **Category Management**
- `GET /categories` - Lấy danh sách categories
- `POST /categories` - Tạo category mới

---

## 🔧 Workflow Tạo Bài Viết

### **Bước 1: Upload thumbnail**
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./thumbnail.jpg"
```

### **Bước 2: Lấy danh sách tags**
```bash
curl -X GET http://localhost:8080/tags
```

### **Bước 3: Tạo bài viết**
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "thumbnail_url": "https://s3-website-r1.s3cloud.vn/hsa/2025-07-05/1720185600000.jpg",
    "category_id": "category-uuid",
    "tags": ["blockchain", "crypto", "bitcoin"]
  }'
```

---

## 📚 Tài liệu chi tiết

### **1. [README.md](./README.md)**
- Hướng dẫn tổng quan về API
- Cấu trúc response format
- Error handling
- Swagger UI

### **2. [API_GUIDE.md](./API_GUIDE.md)**
- Hướng dẫn tích hợp API
- Ví dụ code React/Vue
- Troubleshooting

### **3. [admin-api.md](./admin-api.md)**
- API quản lý hệ thống
- Blog, Category, Tag management
- Authentication

### **4. [user-api.md](./user-api.md)**
- API nghiệp vụ người dùng
- Comment, Like, Forum
- User profile

### **5. [media-api.md](./media-api.md)**
- API upload file
- S3 integration
- File management

### **6. [blog-api-with-tags.md](./blog-api-with-tags.md)**
- API blog với tags
- Workflow hoàn chỉnh
- Mock data

---

## 🎨 Mock Data

Thư mục `mock/` chứa đầy đủ mock data cho:

- ✅ **Authentication responses**
- ✅ **Blog responses** (với tags)
- ✅ **Tag responses**
- ✅ **Media upload responses**
- ✅ **Error responses**
- ✅ **Health check responses**

---

## 🔐 Credentials

### **Admin Account:**
- **Email:** `admin@baotiendientu.com`
- **Password:** `Admin123!`

### **Member Account:**
- **Email:** `member@baotiendientu.com`
- **Password:** `Member123!`

---

## 🌐 Base URLs

### **Development:**
- **API:** `http://localhost:8080`
- **Swagger:** `http://localhost:8080/docs`

### **Production:**
- **API:** `https://api.baotiendientu.com`
- **Swagger:** `https://api.baotiendientu.com/docs`

---

## ⚡ Tính năng mới

### **✅ Tags tự động tạo**
- Nếu tag chưa tồn tại, hệ thống tự động tạo mới
- Hỗ trợ cả ID tag và tên tag

### **✅ Upload ảnh tích hợp**
- API upload ảnh sẵn sàng sử dụng
- S3 Cloud VN integration
- File size limit: 10MB

### **✅ Response format chuẩn**
- Tất cả API đều trả về format chuẩn
- Bao gồm pagination cho danh sách
- Error handling đầy đủ

---

## 🚨 Lưu ý quan trọng

1. **Authentication:** Tất cả API admin cần Bearer token
2. **File upload:** Chỉ hỗ trợ định dạng jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, txt
3. **Tags:** Có thể dùng ID hoặc tên tag, hệ thống tự động xử lý
4. **Error handling:** Luôn check status_code trong response

---

## 📞 Support

Nếu gặp vấn đề hoặc cần hỗ trợ thêm:

1. **Kiểm tra Swagger UI:** http://localhost:8080/docs
2. **Xem log server** để debug
3. **Liên hệ backend team** khi cần thiết

---

## 🎉 Chúc frontend team tích hợp thành công!

Backend đã sẵn sàng và đầy đủ tính năng để frontend team phát triển! 🚀 