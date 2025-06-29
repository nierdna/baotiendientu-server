# Crawler Module

Module crawl HTML content từ các website với hỗ trợ JavaScript rendering thông qua Puppeteer.

## Tính năng

### ✅ Dual Crawling Methods
- **Puppeteer** (default): Headless Chrome browser để render JavaScript
- **Axios** (fallback): HTTP client nhanh cho static content

### ✅ Advanced Options
- Custom User-Agent và headers
- Timeout configuration
- Wait for specific CSS selectors
- Wait for network idle
- Additional wait time after page load

### ✅ Response Formats
- **JSON Response**: Structured data với metadata
- **File Download**: Direct HTML file download hoặc browser display

## API Endpoints

### 1. POST /crawler/crawl-html
Crawl HTML và trả về JSON response với metadata.

**Request Body:**
```json
{
  "url": "https://coin68.com/article/",
  "timeout": 15000,
  "usePuppeteer": true,
  "waitForNetworkIdle": true,
  "waitTime": 2000,
  "waitForSelector": ".article-content",
  "userAgent": "Mozilla/5.0...",
  "headers": {
    "Accept-Language": "vi-VN,vi;q=0.9"
  }
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "HTML content crawled successfully",
  "data": {
    "url": "https://coin68.com/article/",
    "html": "<!DOCTYPE html>...",
    "title": "Tin Tức - Coin68",
    "statusCode": 200,
    "contentLength": 45823,
    "timestamp": "2023-06-15T10:30:00Z"
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### 2. GET /crawler/download-html
Crawl HTML và trả về file để download hoặc display trong browser.

**Query Parameters:**
```
url=https://coin68.com/article/
usePuppeteer=true
waitTime=2000
waitForNetworkIdle=true
download=false
filename=coin68-article
```

**Response:** Direct HTML file với appropriate headers.

## Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to crawl |
| `timeout` | number | 10000 | Request timeout (ms) |
| `usePuppeteer` | boolean | true | Use Puppeteer vs Axios |
| `waitForNetworkIdle` | boolean | true | Wait for network idle |
| `waitTime` | number | 0 | Additional wait time (ms) |
| `waitForSelector` | string | - | CSS selector to wait for |
| `userAgent` | string | default | Custom User-Agent |
| `headers` | object | {} | Custom HTTP headers |

## Puppeteer Features

### Browser Configuration
- Headless Chrome
- Optimized for server environments
- Disabled GPU và sandbox cho Docker

### Wait Strategies
- `networkidle0`: No network requests for 500ms
- `domcontentloaded`: DOM ready
- Custom selector waiting
- Additional time delays

### Error Handling
- Automatic browser cleanup
- Fallback to Axios on Puppeteer failure
- Detailed error logging

## Usage Examples

### Basic Crawling
```typescript
const result = await crawlerService.crawlUrl({
  url: 'https://coin68.com/article/'
});
```

### Advanced Crawling
```typescript
const result = await crawlerService.crawlUrl({
  url: 'https://coin68.com/article/',
  usePuppeteer: true,
  waitForSelector: '.article-list',
  waitTime: 3000,
  waitForNetworkIdle: true
});
```

### File Download
```typescript
const { html, filename } = await crawlerService.crawlHtmlForDownload({
  url: 'https://coin68.com/article/',
  filename: 'coin68-news'
});
```

## Performance Comparison

| Method | Speed | JavaScript Support | Resource Usage |
|--------|-------|-------------------|----------------|
| Axios | ⚡ Fast | ❌ No | 🟢 Low |
| Puppeteer | 🐌 Slower | ✅ Full | 🔴 High |

## Best Practices

1. **Use Puppeteer for JavaScript-heavy sites**
2. **Use Axios for static content sites**
3. **Set appropriate timeouts**
4. **Use waitForSelector for dynamic content**
5. **Monitor resource usage in production**

## Testing

Run the test script:
```bash
./scripts/test-crawler-api.sh
```

This will test both Puppeteer and Axios methods và compare results. 