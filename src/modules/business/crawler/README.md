# Crawler Module

Module crawl HTML content từ các website với hỗ trợ JavaScript rendering thông qua Puppeteer và xử lý ảnh nâng cao.

## Tính năng

### ✅ Dual Crawling Methods
- **Puppeteer** (default): Headless Chrome browser để render JavaScript
- **Axios** (fallback): HTTP client nhanh cho static content

### ✅ Advanced Image Handling
- **Image Loading**: Đợi tất cả ảnh load hoàn toàn
- **Lazy Loading Support**: Scroll để trigger lazy loading images
- **Configurable Scrolling**: Tùy chỉnh số lần scroll
- **Image Detection**: Tự động phát hiện và đếm ảnh trong HTML

### ✅ Advanced Options
- Custom User-Agent và headers
- Timeout configuration
- Wait for specific CSS selectors
- Wait for network idle
- Additional wait time after page load

### ✅ Response Formats
- **JSON Response**: Structured data với metadata
- **File Download**: Direct HTML file download hoặc browser display
- **Article Extraction**: Structured article data với images, titles, content

## API Endpoints

### 1. POST /crawler/crawl-html
Crawl HTML và trả về JSON response với metadata.

**Request Body:**
```json
{
  "url": "https://coin68.com/article/",
  "timeout": 30000,
  "usePuppeteer": true,
  "waitForNetworkIdle": true,
  "waitTime": 3000,
  "waitForSelector": ".article-content",
  "waitForImages": true,
  "scrollToBottom": true,
  "maxScrolls": 5,
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
    "contentLength": 85423,
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
waitTime=3000
waitForNetworkIdle=true
waitForImages=true
scrollToBottom=true
maxScrolls=5
download=false
filename=coin68-article
```

**Response:** Direct HTML file với appropriate headers.

### 3. POST /crawler/extract-articles
Crawl HTML và extract structured article data với images, titles, content.

**Request Body:**
```json
{
  "url": "https://coin68.com/article/",
  "timeout": 30000,
  "usePuppeteer": true,
  "waitForNetworkIdle": true,
  "waitTime": 3000,
  "waitForImages": true,
  "scrollToBottom": true,
  "maxScrolls": 5,
  "articleSelector": ".MuiBox-root.css-16jnb7i",
  "maxArticles": 20,
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
  "message": "Articles extracted successfully",
  "data": {
    "sourceUrl": "https://coin68.com/article/",
    "articles": [
      {
        "image": "https://cdn.coin68.com/images/20250614121235_medium_255x175_19.webp",
        "title": "Liệu BTC có hy vọng tăng lên vùng 125.000 USD vào cuối tháng 6?",
        "content": "Một số dự báo cho rằng nếu Cục Dự trữ Liên bang Mỹ (Fed) hạ lãi suất...",
        "url": "/lieu-btc-co-hy-vong-tang-len-vung-125000-usd-vao-cuoi-thang-6/",
        "date": "14/06/2025",
        "category": "Bitcoin"
      }
    ],
    "totalArticles": 15,
    "pageTitle": "Tin Tức - Coin68",
    "timestamp": "2023-06-15T10:30:00Z",
    "crawlMethod": "puppeteer",
    "processingTime": 15420
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

## Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to crawl |
| `timeout` | number | 30000 | Request timeout (ms) |
| `usePuppeteer` | boolean | true | Use Puppeteer vs Axios |
| `waitForNetworkIdle` | boolean | true | Wait for network idle |
| `waitTime` | number | 0 | Additional wait time (ms) |
| `waitForSelector` | string | - | CSS selector to wait for |
| `waitForImages` | boolean | true | Wait for all images to load |
| `scrollToBottom` | boolean | true | Scroll to trigger lazy loading |
| `maxScrolls` | number | 5 | Maximum scroll attempts |
| `articleSelector` | string | - | Custom CSS selector for articles |
| `maxArticles` | number | 50 | Maximum articles to extract |
| `userAgent` | string | default | Custom User-Agent |
| `headers` | object | {} | Custom HTTP headers |

## Image Handling Features

### 🖼️ Image Loading Strategy
Crawler sử dụng multi-step approach để đảm bảo tất cả ảnh được load:

1. **Enable Images**: Không disable images trong browser
2. **Scroll to Bottom**: Scroll từ từ để trigger lazy loading
3. **Wait for Images**: Đợi tất cả img elements load xong
4. **Timeout Protection**: Tự động timeout sau 15s

### 🔄 Scroll Strategy
```javascript
// Scroll gradually to trigger lazy loading
for (let i = 0; i < maxScrolls; i++) {
  // Scroll to bottom
  window.scrollTo(0, document.body.scrollHeight);
  // Wait for new content
  await delay(1500);
  // Check if new content loaded
  if (newHeight === previousHeight) break;
}
// Scroll back to top
window.scrollTo(0, 0);
```

### ⏱️ Image Wait Logic
```javascript
// Wait for all images to load
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (img.complete && img.naturalWidth > 0) {
    // Already loaded
  } else {
    img.onload = () => loadedCount++;
    img.onerror = () => errorCount++;
  }
});
```

## Puppeteer Features

### Browser Configuration
- Headless Chrome với image support
- Optimized for server environments
- Disabled GPU và sandbox cho Docker
- **Images enabled** để load đầy đủ content

### Wait Strategies
- `networkidle2`: No network requests for 500ms (better for images)
- `domcontentloaded`: DOM ready
- Custom selector waiting
- Image loading completion
- Scroll-based lazy loading
- Additional time delays

### Error Handling
- Automatic browser cleanup
- Fallback to Axios on Puppeteer failure
- Image loading timeout protection
- Detailed error logging

## Usage Examples

### Basic Crawling (Quick Mode)
```typescript
const result = await crawlerService.crawlUrl({
  url: 'https://coin68.com/article/',
  waitForImages: false,
  scrollToBottom: false
});
```

### Full Image Crawling (Recommended)
```typescript
const result = await crawlerService.crawlUrl({
  url: 'https://coin68.com/article/',
  usePuppeteer: true,
  waitForImages: true,
  scrollToBottom: true,
  maxScrolls: 5,
  waitTime: 3000
});
```

### Aggressive Image Loading
```typescript
const result = await crawlerService.crawlUrl({
  url: 'https://coin68.com/article/',
  waitForImages: true,
  scrollToBottom: true,
  maxScrolls: 10,
  waitTime: 5000,
  timeout: 60000
});
```

### File Download with Images
```typescript
const { html, filename } = await crawlerService.crawlHtmlForDownload({
  url: 'https://coin68.com/article/',
  filename: 'coin68-news-with-images',
  waitForImages: true,
  scrollToBottom: true
});
```

### Article Extraction (Recommended)
```typescript
const result = await crawlerService.extractArticlesFromUrl({
  url: 'https://coin68.com/article/',
  usePuppeteer: true,
  waitForImages: true,
  scrollToBottom: true,
  maxScrolls: 5,
  maxArticles: 20
});

// Access extracted articles
result.articles.forEach(article => {
  console.log('Title:', article.title);
  console.log('Image:', article.image);
  console.log('Content:', article.content);
});
```

### Custom Article Selector
```typescript
const result = await crawlerService.extractArticlesFromUrl({
  url: 'https://coin68.com/article/',
  articleSelector: '.MuiBox-root.css-16jnb7i', // Coin68 specific
  maxArticles: 10,
  waitForImages: true
});
```

## Performance Comparison

| Method | Speed | JavaScript | Images | Resource Usage |
|--------|-------|------------|--------|----------------|
| Axios | ⚡ Fast | ❌ No | ❌ No | 🟢 Low |
| Puppeteer (Quick) | 🟡 Medium | ✅ Full | ⚠️ Partial | 🟡 Medium |
| Puppeteer (Full) | 🐌 Slower | ✅ Full | ✅ Complete | 🔴 High |

### Timing Comparison
- **Quick Mode**: ~5-10 seconds
- **Full Image Mode**: ~15-30 seconds
- **Aggressive Mode**: ~30-60 seconds

## Best Practices

### 🚀 Performance Optimization
1. **Use Quick Mode** cho content không cần ảnh
2. **Use Full Mode** cho content cần ảnh đầy đủ
3. **Adjust maxScrolls** dựa trên page length
4. **Set appropriate timeout** cho large pages

### 🎯 Image Optimization
1. **Enable waitForImages** cho news/article sites
2. **Use scrollToBottom** cho infinite scroll pages
3. **Increase maxScrolls** cho very long pages
4. **Monitor content length** để verify image loading

### 🔧 Configuration Tips
```typescript
// For news sites with many images
{
  waitForImages: true,
  scrollToBottom: true,
  maxScrolls: 5,
  waitTime: 3000,
  timeout: 30000
}

// For simple pages
{
  waitForImages: false,
  scrollToBottom: false,
  waitTime: 1000,
  timeout: 15000
}

// For very image-heavy pages
{
  waitForImages: true,
  scrollToBottom: true,
  maxScrolls: 10,
  waitTime: 5000,
  timeout: 60000
}
```

## Testing

Run the comprehensive test scripts:
```bash
# Test basic crawler functionality
./scripts/test-crawler-api.sh

# Test article extraction
./scripts/test-extract-articles.sh
```

### Test Coverage
- ✅ Basic image loading
- ✅ Scroll functionality
- ✅ Performance comparison
- ✅ Different scroll amounts
- ✅ Image count verification
- ✅ Article extraction
- ✅ Image quality optimization
- ✅ Error handling
- ✅ Timeout testing

## Troubleshooting

### Common Issues

**1. Images not loading**
- Increase `waitTime` and `timeout`
- Enable `waitForImages` and `scrollToBottom`
- Check network connectivity

**2. Slow performance**
- Reduce `maxScrolls`
- Disable `waitForImages` if not needed
- Use Quick Mode for testing

**3. Memory issues**
- Monitor browser instances
- Ensure proper cleanup
- Limit concurrent requests

### Debug Mode
Enable detailed logging để debug image loading:
```typescript
// Check browser console logs
console.log(`🔍 [Browser] [waitForAllImages] [total_images]:`, images.length);
``` 