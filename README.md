# 📰 Báo Tiền Điện Tử Server

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer" />
</p>

<h3 align="center">🚀 Hệ thống xử lý tin tức tiền điện tử tự động với AI</h3>

<p align="center">
  <b>Server backend cho ứng dụng báo tiền điện tử với khả năng crawl, xử lý AI, và quản lý nội dung tự động.</b>
</p>

---

## 🎯 Tổng Quan

**Báo Tiền Điện Tử Server** là một hệ thống backend hiện đại được xây dựng bằng NestJS, chuyên xử lý tin tức tiền điện tử từ các nguồn như coin68.com. Hệ thống tích hợp crawler thông minh, xử lý AI, và quản lý nội dung tự động.

## ✨ Tính Năng Chính

### 🕷️ **Web Crawler Engine**
- **Dual Crawling**: Puppeteer cho JavaScript-rendered pages + Axios fallback
- **Smart Image Extraction**: Trích xuất hình ảnh với Next.js URL decoding
- **Anti-Detection**: Stealth mode với rotating user agents
- **Retry Mechanism**: Tự động retry với exponential backoff

### 🤖 **AI Content Processing**
- **Professional Financial Journalism**: Viết lại nội dung theo chuẩn báo chí tài chính
- **Comprehensive Analysis**: Phân tích sâu 800-1200 từ với cấu trúc chuyên nghiệp
- **Vietnamese Market Context**: Góc nhìn thị trường Việt Nam
- **Expert Opinions**: Tạo trích dẫn chuyên gia hợp lý

### 📊 **Automated Processing**
- **Scheduled Crawling**: Tự động crawl mỗi 10 phút
- **Duplicate Detection**: Ngăn chặn nội dung trùng lặp
- **Database Management**: Lưu trữ và quản lý bài viết hiệu quả
- **Processing Metrics**: Theo dõi hiệu suất xử lý

### 🔧 **API Features**
- **RESTful APIs**: Đầy đủ CRUD operations
- **Swagger Documentation**: API docs tự động với examples
- **Standard Response Format**: Định dạng response thống nhất
- **Error Handling**: Xử lý lỗi toàn diện

## 🏗️ Kiến Trúc Hệ Thống

```
src/
├── modules/
│   ├── api/           # API base configurations
│   ├── business/      # Business logic modules
│   │   ├── crawler/   # Web crawling service
│   │   ├── article/   # Article management
│   │   └── services/  # AI processing services
│   ├── database/      # Database entities & repositories
│   ├── queue/         # Background job processing
│   ├── websocket/     # Real-time communications
│   └── worker/        # Scheduled tasks
└── shared/            # Shared utilities & decorators
```

## 🚀 Cài Đặt và Chạy

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- OpenAI API Key

### 1. Clone Repository
```bash
git clone https://github.com/nierdna/baotiendientu-server.git
cd baotiendientu-server
```

### 2. Cài Đặt Dependencies
```bash
npm install

# Cài đặt Chrome cho Puppeteer
npx puppeteer browsers install chrome
```

### 3. Cấu Hình Environment
```bash
cp .env.example .env
```

Cập nhật file `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=baotiendientu

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup Database
```bash
# Tạo database
npm run db:create

# Chạy migrations
npm run migration:run

# Seed data (optional)
npm run seed
```

### 5. Chạy Ứng Dụng
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start
```

## 📡 API Endpoints

### 🕷️ Crawler APIs
```bash
# Crawl HTML từ URL
POST /crawler/crawl-html
GET  /crawler/download-html

# Trích xuất articles từ trang chủ
POST /crawler/extract-articles
```

### 📰 Article APIs
```bash
# Crawl URL đơn lẻ
GET  /articles/crawl-url?url=<article_url>

# Download HTML file
GET  /articles/download-html?url=<article_url>

# Xử lý với AI
POST /articles/process-with-ai
```

### 🏥 Health Check
```bash
GET /health
```

## 🧪 Testing

### Chạy Test Scripts
```bash
# Test crawler APIs
chmod +x scripts/test-crawler-api.sh
./scripts/test-crawler-api.sh

# Test article APIs
chmod +x scripts/test-article-api.sh
./scripts/test-article-api.sh

# Test AI processing
chmod +x scripts/test-process-ai-api.sh
./scripts/test-process-ai-api.sh
```

### Unit & E2E Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Database Schema

### Articles Table
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  content TEXT,
  detail_content TEXT,
  image VARCHAR(1000),
  url VARCHAR(500) UNIQUE,
  date VARCHAR(50),
  category VARCHAR(100),
  source VARCHAR(200),
  is_crawled_detail BOOLEAN DEFAULT FALSE,
  crawled_detail_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Processed Articles Table
```sql
CREATE TABLE processed_articles (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  image VARCHAR(1000),
  content TEXT,
  summary TEXT,
  tags JSON,
  original_url VARCHAR(1000) UNIQUE,
  status VARCHAR(50) DEFAULT 'processed',
  language VARCHAR(10) DEFAULT 'vi',
  format VARCHAR(20) DEFAULT 'markdown',
  processing_time INT,
  ai_provider VARCHAR(100) DEFAULT 'openai',
  ai_model VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Cấu Hình

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=baotiendientu

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# Crawler Configuration
CRAWLER_TIMEOUT=30000
CRAWLER_RETRY_ATTEMPTS=3
CRAWLER_DELAY=2000

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Puppeteer Options
```typescript
const browserOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
};
```

## 📚 Documentation

- **[API Documentation](docs/API-PROCESS-WITH-AI.md)** - Chi tiết về AI processing API
- **[Crawler Guide](src/modules/business/crawler/README.md)** - Hướng dẫn sử dụng crawler
- **[Database Migration](scripts/fix-database-migration.sql)** - Scripts migration database

### Swagger UI
Truy cập API documentation tại: `http://localhost:3000/docs`

## 🔍 Monitoring & Logging

### Console Logs Format
```
🔍 [Service] [Method] [Action]: { data }
✅ [Service] [Method] [Success]: { result }
🔴 [Service] [Method] [Error]: { error }
⚠️ [Service] [Method] [Warning]: { warning }
🤖 [Service] [Method] [AI]: { aiData }
```

### Performance Metrics
- **Crawling Time**: 2-8 seconds
- **AI Processing**: 5-15 seconds  
- **Total Processing**: 10-25 seconds
- **Database Operations**: < 1 second

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t baotiendientu-server .

# Run container
docker run -p 3000:3000 --env-file .env baotiendientu-server
```

### PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [nierdna](https://github.com/nierdna)
- **Project**: Báo Tiền Điện Tử
- **Tech Stack**: NestJS, TypeScript, MySQL, OpenAI, Puppeteer

## 🔗 Links

- **Repository**: [https://github.com/nierdna/baotiendientu-server](https://github.com/nierdna/baotiendientu-server)
- **Issues**: [https://github.com/nierdna/baotiendientu-server/issues](https://github.com/nierdna/baotiendientu-server/issues)
- **Documentation**: [docs/](docs/)

---

<p align="center">
  <b>🚀 Made with ❤️ for the Vietnamese Cryptocurrency Community</b>
</p>
