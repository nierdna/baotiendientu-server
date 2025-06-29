# API Process With AI Documentation

## Overview

API `POST /articles/process-with-ai` cho phép crawl nội dung HTML từ một URL bài viết, xử lý nội dung đó bằng AI để làm sạch, tóm tắt và trích xuất thông tin, sau đó lưu kết quả vào database.

## Endpoint

```
POST /articles/process-with-ai
```

## Request Body

```json
{
  "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/",
  "options": {
    "extractOnly": false,
    "language": "vi",
    "format": "markdown"
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | URL của bài viết cần xử lý |
| `options` | object | ❌ | Tùy chọn xử lý |
| `options.extractOnly` | boolean | ❌ | Chỉ trích xuất nội dung, không xử lý AI (default: false) |
| `options.language` | enum | ❌ | Ngôn ngữ xử lý: "vi" hoặc "en" (default: "vi") |
| `options.format` | enum | ❌ | Định dạng output: "markdown", "html", "text" (default: "markdown") |

## Response

### Success Response (200)

```json
{
  "statusCode": 200,
  "message": "Article processed successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "🔥 Bitcoin bứt phá mạnh mẽ: Làn sóng đầu tư mới đang hình thành?",
    "content": "<h2>🔥 Bitcoin bứt phá mạnh mẽ: Làn sóng đầu tư mới đang hình thành?</h2><p><strong>Thị trường tiền điện tử đang chứng kiến một đợt tăng trưởng ấn tượng khi Bitcoin vượt qua mốc $51.750, tăng 15% trong tuần qua và tạo nên làn sóng lạc quan trong cộng đồng đầu tư.</strong></p><h3>📊 Diễn biến thị trường chi tiết</h3><p>Từ mức $45.000 đầu tuần, Bitcoin đã có những bước tiến vững chắc, với khối lượng giao dịch tăng 40% so với tuần trước. Theo ông Nguyễn Minh Tuấn, chuyên gia phân tích tại Crypto Research Vietnam, đây là tín hiệu tích cực cho thấy sự trở lại của dòng tiền tổ chức.</p><h3>💡 Phân tích nguyên nhân</h3><ul><li><strong>Dòng tiền tổ chức:</strong> Các quỹ đầu tư lớn đã mua vào 12.000 BTC trong tuần qua</li><li><strong>Tin tức ETF:</strong> Kỳ vọng về việc phê duyệt các ETF Bitcoin mới</li><li><strong>Tâm lý thị trường:</strong> Fear & Greed Index tăng từ 35 lên 58</li></ul><h3>🎯 Tác động đến thị trường Việt Nam</h3><p>Các sàn giao dịch tại Việt Nam ghi nhận lượng người dùng mới tăng 25%, với giá trị giao dịch hàng ngày đạt mức cao nhất trong 3 tháng qua. Điều này cho thấy nhà đầu tư Việt đang quan tâm trở lại đến Bitcoin.</p><h3>🔮 Triển vọng và dự báo</h3><p>Các chuyên gia dự đoán Bitcoin có thể test vùng kháng cự $55.000 trong 1-2 tuần tới. Tuy nhiên, nhà đầu tư cần thận trọng với các điểm kháng cự quan trọng và quản lý rủi ro hiệu quả.</p>",
    "summary": "Bitcoin tăng mạnh 15% lên $51.750 nhờ dòng tiền tổ chức và kỳ vọng ETF, tạo làn sóng lạc quan trong cộng đồng đầu tư Việt Nam với khối lượng giao dịch tăng 40%.",
    "tags": ["bitcoin", "cryptocurrency", "dau-tu", "tai-chinh"],
    "originalUrl": "https://coin68.com/tin-tuc/bitcoin-tang-manh/",
    "status": "processed",
    "language": "vi",
    "format": "markdown",
    "processingTime": 5000,
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "createdAt": "2023-06-15T10:30:00Z"
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### Existing Article Response (200)

Nếu bài viết đã được xử lý trước đó, API sẽ trả về kết quả đã lưu:

```json
{
  "statusCode": 200,
  "message": "Article already processed (returning existing result)",
  "data": {
    "id": "existing-article-id",
    "title": "...",
    "content": "...",
    // ... other fields
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### Error Response (400)

```json
{
  "statusCode": 400,
  "message": "Failed to process article: Invalid URL",
  "error": "Bad Request"
}
```

## Workflow

1. **Kiểm tra duplicate**: Kiểm tra xem URL đã được xử lý chưa
2. **Crawl HTML**: Sử dụng Puppeteer để crawl nội dung HTML đầy đủ
3. **Xử lý AI**: 
   - Nếu `extractOnly: true`: Chỉ trích xuất nội dung cơ bản
   - Nếu `extractOnly: false`: Sử dụng OpenAI để xử lý và làm sạch nội dung
4. **Lưu database**: Lưu kết quả vào bảng `processed_articles`
5. **Trả về kết quả**: Response với thông tin bài viết đã xử lý

## AI Processing Features

### 1. Content Extraction & Cleaning
- Loại bỏ ads, navigation, footer, sidebar
- Giữ lại nội dung chính và hình ảnh quan trọng
- Làm sạch HTML tags không cần thiết

### 2. Professional Financial Journalism (Vietnamese Style)
- **Cấu trúc chuyên nghiệp**: Lead → Body → Background → Impact → Expert Opinion → Outlook
- **Nội dung chi tiết và đầy đủ**: 800-1200 từ, phân tích sâu
- **Phong cách nhà báo**: Chuyên nghiệp nhưng dễ hiểu, có trích dẫn chuyên gia
- **Định dạng HTML**: Sử dụng thẻ h2, h3, p, strong, ul/li
- **Mở rộng thông tin**: Thêm context, nguyên nhân, tác động, dự báo
- **Góc nhìn Việt Nam**: Liên hệ với thị trường và nhà đầu tư Việt
- **Tuyệt đối không để lộ nguồn gốc**

### 3. Multilingual Support
- Tiếng Việt (`vi`): Xử lý và trả về nội dung tiếng Việt
- Tiếng Anh (`en`): Xử lý và trả về nội dung tiếng Anh

### 4. Multiple Output Formats
- **Markdown**: Định dạng Markdown với headers, links
- **HTML**: Clean HTML với proper tags
- **Text**: Plain text đã được làm sạch

## Database Schema

Kết quả được lưu trong bảng `processed_articles`:

```sql
CREATE TABLE processed_articles (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags JSON,
  originalUrl VARCHAR(1000) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'processed',
  language VARCHAR(10) DEFAULT 'vi',
  format VARCHAR(20) DEFAULT 'markdown',
  processingTime INT,
  aiProvider VARCHAR(100) DEFAULT 'openai',
  aiModel VARCHAR(50),
  viewCount INT DEFAULT 0,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage Examples

### 1. Basic Processing

```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
  }'
```

### 2. Extract Only (No AI)

```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/",
    "options": {
      "extractOnly": true,
      "format": "markdown"
    }
  }'
```

### 3. English Processing with HTML Format

```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/ethereum-update/",
    "options": {
      "language": "en",
      "format": "html",
      "extractOnly": false
    }
  }'
```

## Performance

- **Crawling time**: 2-5 giây (tùy thuộc vào website)
- **AI processing time**: 3-10 giây (tùy thuộc vào độ dài nội dung)
- **Total processing time**: 5-15 giây
- **Duplicate check**: < 100ms

## Error Handling

### Common Errors

1. **Invalid URL**: URL không hợp lệ hoặc không accessible
2. **Crawling Failed**: Website không thể crawl được
3. **AI Processing Failed**: OpenAI API error (fallback to extraction only)
4. **Database Error**: Lỗi khi lưu vào database

### Fallback Mechanisms

1. **AI Failure**: Nếu AI processing fail, tự động fallback về basic extraction
2. **Crawling Failure**: Retry với axios nếu Puppeteer fail
3. **Parsing Failure**: Fallback parsing nếu JSON response từ AI không valid

## Monitoring & Logging

### Console Logs

```
🤖 [ArticleController] [processWithAi] [starting]: { url, options }
🔍 [ArticleController] [processWithAi] [crawling_html]
✅ [ArticleController] [processWithAi] [html_crawled]: { contentLength, crawlTime }
🤖 [ArticleController] [processWithAi] [processing_with_ai]
✅ [ArticleController] [processWithAi] [ai_processed]: { aiProcessingTime, titleLength, contentLength, tagsCount }
💾 [ArticleController] [processWithAi] [saving_to_db]
✅ [ArticleController] [processWithAi] [success]: { id, url, totalProcessingTime }
```

### Metrics Tracked

- Processing time breakdown (crawl, AI, database)
- Content length (input HTML, output content)
- AI processing success rate
- Duplicate detection rate

## Testing

Sử dụng test script:

```bash
./scripts/test-process-ai-api.sh
```

Test script bao gồm:
- Basic processing test
- Custom options test
- Extract-only test
- Duplicate processing test
- Error handling test
- Performance test

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Dependencies

- **OpenAI API**: Để xử lý nội dung bằng AI
- **Puppeteer**: Để crawl JavaScript-rendered content
- **Cheerio**: Để parse và manipulate HTML
- **TypeORM**: Để lưu trữ database

## Related APIs

- `GET /articles/crawl-url`: Crawl HTML content only
- `GET /articles/download-html`: Download HTML as file
- `POST /crawler/extract-articles`: Extract article list from homepage 