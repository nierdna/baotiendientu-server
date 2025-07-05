#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Copying Client API Package${NC}"
echo "=================================="

# Create destination directory
DEST_DIR="./client-api-package"
mkdir -p "$DEST_DIR"

# Copy all files from src/client to destination
echo -e "${YELLOW}📁 Copying files...${NC}"
cp -r src/client/* "$DEST_DIR/"

# Create a summary file
echo -e "${YELLOW}📝 Creating package summary...${NC}"
cat > "$DEST_DIR/PACKAGE_SUMMARY.md" << 'EOF'
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
EOF

echo -e "${GREEN}✅ Package copied successfully!${NC}"
echo -e "${BLUE}📁 Location: $DEST_DIR${NC}"
echo -e "${YELLOW}📋 Files included:${NC}"
ls -la "$DEST_DIR"

echo -e "\n${BLUE}🎉 Ready to send to frontend team!${NC}"
echo -e "${YELLOW}💡 You can now zip this folder and send to client${NC}"
echo -e "${YELLOW}💡 Or copy the entire folder to their project${NC}" 