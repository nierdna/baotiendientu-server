# 🔐 Environment Variables Setup

## 📋 Tổng quan

Dự án sử dụng environment variables để bảo mật các thông tin nhạy cảm như API keys, database credentials, và cấu hình server.

## 🚀 Cách setup

### 1. Tạo file .env
```bash
# Copy file env.example thành .env
cp env.example .env

# Hoặc copy file env.local (đã có sẵn API key)
cp env.local .env
```

### 2. Cập nhật các giá trị trong .env
```bash
# Mở file .env và cập nhật các giá trị cần thiết
nano .env
```

### 3. Các biến quan trọng cần cập nhật:

#### 🔑 **API Keys (Bắt buộc)**
```env
# ImgBB API Key (đã có sẵn)
IMGBB_API_KEY=309bdd8d5ff4767d0d1092937476613b

# JWT Secret (thay đổi ngay!)
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
```

#### 🗄️ **Database (Bắt buộc)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=baotiendientu
```

#### 🤖 **AI/OpenAI (Tùy chọn)**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🔒 Bảo mật

### ⚠️ **QUAN TRỌNG:**
1. **KHÔNG commit file .env lên git**
2. **File .env đã được thêm vào .gitignore**
3. **Chỉ commit file env.example**

### 📁 File structure:
```
backend/
├── .env                    # ❌ KHÔNG commit (chứa secrets)
├── .env.example           # ✅ Có thể commit (template)
├── env.local              # ✅ Có thể commit (local dev)
└── ENV_SETUP.md          # ✅ Hướng dẫn này
```

## 🛠️ Sử dụng trong code

### Trong NestJS:
```typescript
// Lấy giá trị từ environment
const apiKey = process.env.IMGBB_API_KEY;
const port = process.env.PORT || 8080;
```

### Trong MediaService:
```typescript
constructor() {
  this.imgbbApiKey = process.env.IMGBB_API_KEY || 'default_key';
  this.imgbbApiUrl = process.env.IMGBB_API_URL || 'https://api.imgbb.com/1/upload';
}
```

## 🌍 Environment cho Production

### 1. Tạo file .env.production
```bash
cp env.example .env.production
```

### 2. Cập nhật cho production:
```env
NODE_ENV=production
PORT=3000
DEBUG=false
SWAGGER_ENABLED=false

# Database production
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password

# JWT production (thay đổi!)
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
```

## 🔧 Troubleshooting

### Lỗi "Cannot read property of undefined"
- Kiểm tra file .env có tồn tại không
- Kiểm tra biến environment có được load không

### Lỗi "API key invalid"
- Kiểm tra IMGBB_API_KEY có đúng không
- Kiểm tra API key có hoạt động không

### Lỗi database connection
- Kiểm tra DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- Kiểm tra database có running không

## 📝 Notes

- **Development:** Sử dụng file .env với DEBUG=true
- **Production:** Sử dụng file .env.production với DEBUG=false
- **Testing:** Có thể tạo file .env.test riêng
- **Docker:** Sử dụng environment variables trong docker-compose.yml

## 🚀 Deploy

### Railway/Heroku:
```bash
# Set environment variables trong dashboard
IMGBB_API_KEY=your_key
JWT_SECRET=your_secret
DB_HOST=your_db_host
```

### Docker:
```bash
# Trong docker-compose.yml
environment:
  - IMGBB_API_KEY=${IMGBB_API_KEY}
  - JWT_SECRET=${JWT_SECRET}
```

---

**✅ Hoàn thành setup environment variables!** 