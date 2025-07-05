# 📦 Client API Package Summary

## 📁 Files Included:

### 📚 Documentation
- `README.md` - Hướng dẫn tổng quan
- `API_GUIDE.md` - Hướng dẫn tích hợp API
- `admin-api.md` - API quản lý hệ thống (Admin)
- `user-api.md` - API nghiệp vụ người dùng (User)
- `media-api.md` - API upload file (Admin)
- `blog-api-with-tags.md` - API blog với tags (Admin)
- `DELIVERY_PACKAGE.md` - Tổng quan package

### 🎨 Mock Data
- `mock/` - Thư mục chứa tất cả mock data
  - Authentication responses
  - Blog responses (với tags)
  - Tag responses
  - Media upload responses
  - Error responses
  - Health check responses

## 🚀 Quick Start

1. **Đăng nhập:**
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
  }'
```

2. **Test API:**
```bash
# Health check
curl http://localhost:8080/health

# Lấy tags
curl http://localhost:8080/tags

# Upload ảnh
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./example.jpg"
```

## 📋 Credentials

- **Admin:** admin@baotiendientu.com | Admin123!
- **Member:** member@baotiendientu.com | Member123!

## 🌐 URLs

- **Development:** http://localhost:8080
- **Swagger:** http://localhost:8080/docs

## ⚡ Tính năng mới

✅ **Tags tự động tạo** - Hệ thống tự động tạo tags mới  
✅ **Upload ảnh tích hợp** - API upload sẵn sàng sử dụng  
✅ **Blog với tags** - Tạo/sửa bài viết với tags  
✅ **Mock data đầy đủ** - Cho development độc lập  

---
*Package được tạo tự động từ backend Báo Tiền Điện Tử*
