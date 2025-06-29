#!/bin/bash

# Test Crawler API Script
BASE_URL="http://localhost:3000"

echo "🔍 Testing Crawler API..."
echo "================================"

# Test 1: Crawl HTML with Puppeteer (JSON Response)
echo "📝 Test 1: Crawl HTML with Puppeteer (JSON Response)"
echo "POST $BASE_URL/crawler/crawl-html"
curl -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "timeout": 15000,
    "usePuppeteer": true,
    "waitForNetworkIdle": true,
    "waitTime": 2000
  }' | jq '.data.title, .data.contentLength, .data.statusCode'

echo -e "\n================================\n"

# Test 2: Download HTML with Puppeteer (File Response)
echo "📥 Test 2: Download HTML with Puppeteer (File Response - Display in browser)"
echo "GET $BASE_URL/crawler/download-html?url=https://coin68.com/article/&usePuppeteer=true&waitTime=2000"
curl -X GET "$BASE_URL/crawler/download-html?url=https://coin68.com/article/&usePuppeteer=true&waitTime=2000&waitForNetworkIdle=true" \
  -H "Accept: text/html" \
  --output "test-output-display.html"

if [ -f "test-output-display.html" ]; then
  echo "✅ HTML file saved as test-output-display.html"
  echo "📊 File size: $(wc -c < test-output-display.html) bytes"
else
  echo "❌ Failed to save HTML file"
fi

echo -e "\n================================\n"

# Test 3: Download HTML (Force Download)
echo "📥 Test 3: Download HTML (Force Download)"
echo "GET $BASE_URL/crawler/download-html?url=https://coin68.com/article/&download=true&filename=coin68-test"
curl -X GET "$BASE_URL/crawler/download-html?url=https://coin68.com/article/&download=true&filename=coin68-test" \
  -H "Accept: text/html" \
  --output "test-output-download.html"

if [ -f "test-output-download.html" ]; then
  echo "✅ HTML file saved as test-output-download.html"
  echo "📊 File size: $(wc -c < test-output-download.html) bytes"
else
  echo "❌ Failed to save HTML file"
fi

echo -e "\n================================\n"

# Test 4: Compare Puppeteer vs Axios
echo "🔄 Test 4: Compare Puppeteer vs Axios (Content Length)"
echo "POST $BASE_URL/crawler/crawl-html (Axios)"
AXIOS_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": false
  }' | jq -r '.data.contentLength')

echo "Axios content length: $AXIOS_LENGTH bytes"

echo "POST $BASE_URL/crawler/crawl-html (Puppeteer)"
PUPPETEER_LENGTH=$(curl -s -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitTime": 2000
  }' | jq -r '.data.contentLength')

echo "Puppeteer content length: $PUPPETEER_LENGTH bytes"

if [ "$PUPPETEER_LENGTH" -gt "$AXIOS_LENGTH" ]; then
  echo "✅ Puppeteer captured more content (+$((PUPPETEER_LENGTH - AXIOS_LENGTH)) bytes)"
else
  echo "⚠️ Similar content length detected"
fi

echo -e "\n================================\n"

# Test 5: Error handling (Invalid URL)
echo "❌ Test 5: Error handling (Invalid URL)"
echo "POST $BASE_URL/crawler/crawl-html"
curl -X POST "$BASE_URL/crawler/crawl-html" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://invalid-domain-that-does-not-exist.com"
  }' | jq '.'

echo -e "\n================================\n"
echo "🎉 All tests completed!"

# Cleanup
if [ -f "test-output-display.html" ]; then
  echo "🧹 Cleaning up test files..."
  rm -f test-output-display.html test-output-download.html
  echo "✅ Cleanup completed"
fi 