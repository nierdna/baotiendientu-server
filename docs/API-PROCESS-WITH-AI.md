# API Process with AI Documentation

## Overview

The Process with AI API crawls article HTML content and processes it using AI to extract clean, structured content with professional financial journalism quality. The API includes advanced image extraction capabilities and saves processed articles to the database.

## Endpoint

**POST** `/articles/process-with-ai`

## Features

- **Dual Crawling Engine**: Puppeteer for JavaScript-rendered pages with axios fallback
- **AI-Powered Content Processing**: Professional financial journalism with comprehensive analysis
- **Image Extraction**: Smart image detection with Next.js URL decoding
- **Duplicate Prevention**: Automatic detection of already processed articles
- **Database Storage**: Persistent storage with optimized schema
- **Comprehensive Logging**: Detailed processing metrics and timing

## Request

### Headers
```
Content-Type: application/json
```

### Body Schema

```typescript
{
  url: string;           // Required: Article URL to process
  options?: {
    extractOnly?: boolean;    // Optional: Extract without AI processing (default: false)
    language?: 'vi' | 'en';  // Optional: Processing language (default: 'vi')
    format?: 'markdown' | 'html' | 'text'; // Optional: Output format (default: 'markdown')
  }
}
```

### Request Example

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

## Response

### Success Response (200)

```typescript
{
  statusCode: 200;
  message: string;
  data: {
    id: string;                    // Processed article ID
    title: string;                 // AI-processed title with emojis
    image: string | null;          // Main article image URL
    content: string;               // AI-processed comprehensive content
    summary: string | null;        // AI-generated summary
    tags: string[] | null;         // AI-extracted tags
    originalUrl: string;           // Original article URL
    status: string;                // Processing status
    language: string;              // Content language
    format: string;                // Content format
    processingTime: number | null; // Total processing time (ms)
    aiProvider: string;            // AI provider used
    aiModel: string | null;        // AI model used
    createdAt: Date;               // Creation timestamp
  };
  timestamp: string;
}
```

### Response Example

```json
{
  "statusCode": 200,
  "message": "Article processed successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "🔥 Bitcoin Tăng Mạnh Lên $42,000: Phân Tích Chuyên Sâu Về Xu Hướng Thị Trường",
    "image": "https://coin68.com/images/bitcoin-analysis-chart.jpg",
    "content": "<h2>🔥 Bitcoin Đạt Mốc $42,000 - Bước Ngoặt Quan Trọng</h2>\n<p><strong>Bitcoin đã chạm mốc $42,000 trong phiên giao dịch hôm nay, đánh dấu mức tăng 15% trong tuần qua và tạo ra làn sóng lạc quan mạnh mẽ trên toàn thị trường tiền điện tử...</strong></p>\n\n<h3>📊 Diễn Biến Chi Tiết</h3>\n<p>Trong 24 giờ qua, Bitcoin đã có một đợt tăng trưởng ấn tượng...</p>",
    "summary": "Bitcoin đã tăng mạnh lên $42,000, đánh dấu mức tăng 15% trong tuần với sự hỗ trợ từ các yếu tố vĩ mô tích cực và dòng vốn tổ chức mạnh mẽ.",
    "tags": ["bitcoin", "cryptocurrency", "market-analysis", "price-surge", "institutional-investment"],
    "originalUrl": "https://coin68.com/tin-tuc/bitcoin-tang-manh/",
    "status": "processed",
    "language": "vi",
    "format": "markdown",
    "processingTime": 12500,
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "createdAt": "2023-06-15T10:30:00Z"
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

## AI Processing Features

### Professional Financial Journalism

The AI creates comprehensive financial articles with:

- **Lead**: Engaging opening with key information
- **Body**: Detailed analysis with market data
- **Background**: Context and root causes
- **Impact**: Market and investor implications
- **Expert Opinion**: Quoted expert analysis (AI-generated)
- **Outlook**: Forecasts and recommendations

### Content Structure

- **Length**: 800-1200 words for comprehensive coverage
- **Format**: Professional HTML with proper sections (h2, h3, p, ul/li)
- **Style**: Financial journalism with emojis (📈, 📉, 💰, 🔥, ⚡, 🎯, 💡)
- **Context**: Vietnamese market perspective and local impact analysis

### Image Extraction

The API intelligently extracts images with:

- **Priority Sources**: OpenGraph, Twitter meta tags, article images
- **Smart Filtering**: Skips SVG placeholders and data URLs
- **Next.js Support**: Decodes encoded image URLs from /_next/image/
- **Absolute URLs**: Converts relative paths to absolute URLs

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Failed to process article: Invalid URL provided",
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### 409 Conflict (Already Processed)
```json
{
  "statusCode": 200,
  "message": "Article already processed (returning existing result)",
  "data": {
    // ... existing processed article data
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

## Usage Examples

### Basic Processing
```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
  }'
```

### Extract-Only Mode
```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/ethereum-update/",
    "options": {
      "extractOnly": true,
      "format": "html"
    }
  }'
```

### Custom AI Processing
```bash
curl -X POST "http://localhost:3000/articles/process-with-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/solana-analysis/",
    "options": {
      "extractOnly": false,
      "language": "vi",
      "format": "markdown"
    }
  }'
```

## Database Schema

Processed articles are stored in the `processed_articles` table with:

```sql
CREATE TABLE processed_articles (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  image VARCHAR(1000),
  content TEXT,
  summary TEXT,
  tags JSON,
  original_url VARCHAR(1000) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'processed',
  language VARCHAR(10) DEFAULT 'vi',
  format VARCHAR(20) DEFAULT 'markdown',
  processing_time INT,
  ai_provider VARCHAR(100) DEFAULT 'openai',
  ai_model VARCHAR(50),
  view_count INT DEFAULT 0,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Performance Metrics

- **Crawling Time**: 2-8 seconds depending on page complexity
- **AI Processing**: 5-15 seconds for comprehensive analysis
- **Total Processing**: 10-25 seconds end-to-end
- **Database Storage**: < 1 second for save operations

## Best Practices

1. **URL Validation**: Always provide complete, valid URLs
2. **Duplicate Handling**: API automatically handles duplicates
3. **Error Handling**: Implement proper error handling for network issues
4. **Rate Limiting**: Respect API rate limits for production usage
5. **Content Review**: Review AI-generated content for accuracy

## Testing

Use the provided test script:
```bash
chmod +x scripts/test-process-ai-api.sh
./scripts/test-process-ai-api.sh
```

The test script validates:
- ✅ Basic processing functionality
- ✅ Extract-only mode
- ✅ AI processing with summary/tags/image
- ✅ Duplicate detection
- ✅ Error handling
- ✅ Validation
- ✅ Processing time tracking

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