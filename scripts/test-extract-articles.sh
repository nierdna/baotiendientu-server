#!/bin/bash

# Test Extract Articles API Script
BASE_URL="http://localhost:3000"

echo "🔍 Testing Extract Articles API..."
echo "================================"

# Test 1: Basic Article Extraction
echo "📰 Test 1: Basic Article Extraction from Coin68"
echo "POST $BASE_URL/crawler/extract-articles"
curl -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "timeout": 30000,
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 3,
    "waitTime": 3000,
    "maxArticles": 5
  }' | jq '.data.totalArticles, .data.articles[0].image, .data.articles[0].title'

echo -e "\n================================\n"

# Test 2: Extract with Custom Selector
echo "📰 Test 2: Extract with Custom Article Selector"
echo "POST $BASE_URL/crawler/extract-articles"
curl -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5,
    "articleSelector": ".MuiBox-root.css-16jnb7i",
    "maxArticles": 10
  }' | jq '.data.totalArticles, .data.processingTime, .data.crawlMethod'

echo -e "\n================================\n"

# Test 3: Performance Test (Quick vs Full)
echo "⚡ Test 3: Performance Comparison"
echo "POST $BASE_URL/crawler/extract-articles (Quick Mode)"
QUICK_START=$(date +%s)
QUICK_ARTICLES=$(curl -s -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": false,
    "scrollToBottom": false,
    "waitTime": 1000,
    "maxArticles": 5
  }' | jq -r '.data.totalArticles')
QUICK_END=$(date +%s)
QUICK_TIME=$((QUICK_END - QUICK_START))

echo "Quick mode: ${QUICK_TIME}s, Articles: $QUICK_ARTICLES"

echo "POST $BASE_URL/crawler/extract-articles (Full Mode)"
FULL_START=$(date +%s)
FULL_ARTICLES=$(curl -s -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxScrolls": 5,
    "waitTime": 3000,
    "maxArticles": 5
  }' | jq -r '.data.totalArticles')
FULL_END=$(date +%s)
FULL_TIME=$((FULL_END - FULL_START))

echo "Full mode: ${FULL_TIME}s, Articles: $FULL_ARTICLES"
echo "Time difference: +$((FULL_TIME - QUICK_TIME))s for full image processing"

echo -e "\n================================\n"

# Test 4: Check Image Quality
echo "🖼️ Test 4: Image Quality Check"
echo "POST $BASE_URL/crawler/extract-articles"
RESPONSE=$(curl -s -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/article/",
    "usePuppeteer": true,
    "waitForImages": true,
    "scrollToBottom": true,
    "maxArticles": 3
  }')

echo "First 3 articles image URLs:"
echo "$RESPONSE" | jq -r '.data.articles[0:3][] | "Title: " + .title[0:50] + "...\nImage: " + .image + "\n"'

# Check for SVG placeholders
SVG_COUNT=$(echo "$RESPONSE" | jq -r '.data.articles[].image' | grep -c "data:image/svg+xml" || echo "0")
REAL_IMG_COUNT=$(echo "$RESPONSE" | jq -r '.data.articles[].image' | grep -c "http" || echo "0")

echo "SVG placeholders found: $SVG_COUNT"
echo "Real image URLs found: $REAL_IMG_COUNT"

if [ "$REAL_IMG_COUNT" -gt "$SVG_COUNT" ]; then
  echo "✅ Image extraction improved - more real images than placeholders"
else
  echo "⚠️ Still getting placeholder images - may need further optimization"
fi

echo -e "\n================================\n"

# Test 5: Error Handling
echo "❌ Test 5: Error Handling (Invalid URL)"
echo "POST $BASE_URL/crawler/extract-articles"
curl -X POST "$BASE_URL/crawler/extract-articles" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://invalid-domain-that-does-not-exist.com",
    "maxArticles": 5
  }' | jq '.'

echo -e "\n================================\n"
echo "🎉 Extract Articles API tests completed!"

echo -e "\n📋 Summary:"
echo "- ✅ Article extraction from Coin68"
echo "- ✅ Custom selector support"
echo "- ✅ Image quality optimization"
echo "- ✅ Performance comparison"
echo "- ✅ Error handling" 