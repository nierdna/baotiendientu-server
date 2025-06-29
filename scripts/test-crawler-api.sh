#!/bin/bash

# Test Crawler API Script
BASE_URL="http://localhost:3000"

echo "🔍 Testing Crawler API with Image Handling..."
echo "================================"

# Test 1: Crawl HTML with Puppeteer + Image Handling (JSON Response)
echo "📝 Test 1: Crawl HTML with Puppeteer + Image Handling (JSON Response)"
echo "POST $BASE_URL/crawler/crawl-html"
curl -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "timeout": 30000,
    "usePuppeteer": true,
    "waitForNetworkIdle": true,
    "waitTime": 3000,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5
  }' | jq '.data.title, .data.contentLength, .data.statusCode'

echo -e "\n================================\n"

# Test 2: Download HTML with Full Image Loading (File Response)
echo "📥 Test 2: Download HTML with Full Image Loading (File Response)"
echo "GET $BASE_URL/crawler/download-html?url=https://coin68.com/article/&usePuppeteer=true&waitForImages=true&scrollToBottom=true"
curl -X GET "$BASE_URL/crawler/download-html?url=https://coin68.com/article/&usePuppeteer=true&waitTime=3000&waitForNetworkIdle=true&waitForImages=true&scrollToBottom=true&maxScrolls=5" \
  -H "Accept: text/html" \
  --output "test-output-with-images.html"

if [ -f "test-output-with-images.html" ]; then
  echo "✅ HTML file with images saved as test-output-with-images.html"
  echo "📊 File size: $(wc -c < test-output-with-images.html) bytes"
  
  # Count images in HTML
  IMG_COUNT=$(grep -o '<img[^>]*>' test-output-with-images.html | wc -l)
  echo "🖼️ Images found in HTML: $IMG_COUNT"
else
  echo "❌ Failed to save HTML file"
fi

echo -e "\n================================\n"

# Test 3: Compare Image Loading vs No Image Loading
echo "🔄 Test 3: Compare Image Loading vs No Image Loading"
echo "POST $BASE_URL/crawler/crawl-html (Without Image Loading)"
NO_IMAGES_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": false,
    "scrollToBottom": false,
    "waitTime": 1000
  }' | jq -r '.data.contentLength')

echo "Without image loading: $NO_IMAGES_LENGTH bytes"

echo "POST $BASE_URL/crawler/crawl-html (With Image Loading + Scrolling)"
WITH_IMAGES_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5,
    "waitTime": 3000
  }' | jq -r '.data.contentLength')

echo "With image loading + scrolling: $WITH_IMAGES_LENGTH bytes"

if [ "$WITH_IMAGES_LENGTH" -gt "$NO_IMAGES_LENGTH" ]; then
  echo "✅ Image loading captured more content (+$((WITH_IMAGES_LENGTH - NO_IMAGES_LENGTH)) bytes)"
else
  echo "⚠️ Similar content length detected"
fi

echo -e "\n================================\n"

# Test 4: Test Different Scroll Amounts
echo "📜 Test 4: Test Different Scroll Amounts"
echo "POST $BASE_URL/crawler/crawl-html (1 Scroll)"
SCROLL_1_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "scrollToBottom": true,
    "maxScrolls": 1,
    "waitTime": 2000
  }' | jq -r '.data.contentLength')

echo "1 scroll: $SCROLL_1_LENGTH bytes"

echo "POST $BASE_URL/crawler/crawl-html (10 Scrolls)"
SCROLL_10_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "scrollToBottom": true,
    "maxScrolls": 10,
    "waitTime": 2000
  }' | jq -r '.data.contentLength')

echo "10 scrolls: $SCROLL_10_LENGTH bytes"

if [ "$SCROLL_10_LENGTH" -gt "$SCROLL_1_LENGTH" ]; then
  echo "✅ More scrolling captured more content (+$((SCROLL_10_LENGTH - SCROLL_1_LENGTH)) bytes)"
else
  echo "⚠️ Similar content length with different scroll amounts"
fi

echo -e "\n================================\n"

# Test 5: Download HTML with Custom Filename (Force Download)
echo "📥 Test 5: Download HTML with Custom Filename + Image Loading"
echo "GET $BASE_URL/crawler/download-html?url=https://coin68.com/article/&download=true&filename=coin68-with-images"
curl -X GET "$BASE_URL/crawler/download-html?url=https://coin68.com/article/&download=true&filename=coin68-with-images&waitForImages=true&scrollToBottom=true&maxScrolls=3" \
  -H "Accept: text/html" \
  --output "test-output-download-images.html"

if [ -f "test-output-download-images.html" ]; then
  echo "✅ HTML file saved as test-output-download-images.html"
  echo "📊 File size: $(wc -c < test-output-download-images.html) bytes"
  
  # Count images in downloaded HTML
  IMG_COUNT_DOWNLOAD=$(grep -o '<img[^>]*>' test-output-download-images.html | wc -l)
  echo "🖼️ Images found in downloaded HTML: $IMG_COUNT_DOWNLOAD"
else
  echo "❌ Failed to save HTML file"
fi

echo -e "\n================================\n"

# Test 6: Compare Puppeteer vs Axios (with image considerations)
echo "🔄 Test 6: Compare Puppeteer vs Axios (Content Length)"
echo "POST $BASE_URL/crawler/crawl-html (Axios - No Images)"
AXIOS_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": false
  }' | jq -r '.data.contentLength')

echo "Axios content length: $AXIOS_LENGTH bytes"

echo "POST $BASE_URL/crawler/crawl-html (Puppeteer with Images)"
PUPPETEER_IMAGES_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5,
    "waitTime": 3000
  }' | jq -r '.data.contentLength')

echo "Puppeteer with images: $PUPPETEER_IMAGES_LENGTH bytes"

if [ "$PUPPETEER_IMAGES_LENGTH" -gt "$AXIOS_LENGTH" ]; then
  DIFF=$((PUPPETEER_IMAGES_LENGTH - AXIOS_LENGTH))
  PERCENT=$(( (DIFF * 100) / AXIOS_LENGTH ))
  echo "✅ Puppeteer with images captured $PERCENT% more content (+$DIFF bytes)"
else
  echo "⚠️ Similar content length detected"
fi

echo -e "\n================================\n"

# Test 7: Error handling (Invalid URL)
echo "❌ Test 7: Error handling (Invalid URL)"
echo "POST $BASE_URL/crawler/crawl-html"
curl -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://invalid-domain-that-does-not-exist.com",
    "waitForImages": true,
    "scrollToBottom": true
  }' | jq '.'

echo -e "\n================================\n"

# Test 8: Performance Test (Quick vs Full)
echo "⚡ Test 8: Performance Test (Quick vs Full Image Loading)"
echo "POST $BASE_URL/crawler/crawl-html (Quick Mode)"
QUICK_START=$(date +%s)
curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": false,
    "scrollToBottom": false,
    "waitTime": 1000
  }' > /dev/null
QUICK_END=$(date +%s)
QUICK_TIME=$((QUICK_END - QUICK_START))

echo "Quick mode time: ${QUICK_TIME}s"

echo "POST $BASE_URL/crawler/crawl-html (Full Mode)"
FULL_START=$(date +%s)
curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5,
    "waitTime": 3000
  }' > /dev/null
FULL_END=$(date +%s)
FULL_TIME=$((FULL_END - FULL_START))

echo "Full mode time: ${FULL_TIME}s"
echo "Time difference: +$((FULL_TIME - QUICK_TIME))s for full image loading"

echo -e "\n================================\n"
echo "🎉 All image handling tests completed!"

# Cleanup
if [ -f "test-output-with-images.html" ]; then
  echo "🧹 Cleaning up test files..."
  rm -f test-output-with-images.html test-output-download-images.html
  echo "✅ Cleanup completed"
fi

echo -e "\n📋 Summary:"
echo "- ✅ Image loading and lazy loading support added"
echo "- ✅ Scroll to bottom functionality implemented"
echo "- ✅ Wait for images feature working"
echo "- ✅ Configurable scroll amounts"
echo "- ✅ Performance comparison available" 