#!/bin/bash

# Test script for Article Processing with AI API
# Usage: ./test-process-ai-api.sh

echo "=========================================="
echo "Testing Article Process with AI API"
echo "=========================================="

BASE_URL="http://localhost:3000"
API_ENDPOINT="$BASE_URL/articles/process-with-ai"

# Test URLs
TEST_URLS=(
  "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
  "https://coin68.com/tin-tuc/ethereum-cap-nhat-moi/"
)

echo ""
echo "🔍 Testing API Endpoint: $API_ENDPOINT"
echo ""

# Test 1: Professional Financial Journalism (Vietnamese Style)
echo "📝 Test 1: Professional Financial Journalism - Comprehensive Article"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
  }' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 2: AI Processing with custom options
echo "📝 Test 2: AI Processing with custom options (English, HTML format)"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/ethereum-cap-nhat-moi/",
    "options": {
      "language": "en",
      "format": "html",
      "extractOnly": false
    }
  }' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 3: Extract Only (without AI processing)
echo "📝 Test 3: Extract Only (without AI processing)"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/",
    "options": {
      "extractOnly": true,
      "format": "markdown"
    }
  }' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 4: Duplicate processing (should return existing result)
echo "📝 Test 4: Duplicate processing (should return existing result)"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
  }' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 5: Invalid URL
echo "📝 Test 5: Invalid URL (should return error)"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "invalid-url"
  }' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 6: Missing URL
echo "📝 Test 6: Missing URL (should return validation error)"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo ""
echo "-----------------------------------"
echo ""

# Test 7: Vietnamese financial style with markdown format
echo "📝 Test 7: Vietnamese financial style with markdown format"
echo "-----------------------------------"

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/dogecoin-phan-tich/",
    "options": {
      "language": "vi",
      "format": "markdown",
      "extractOnly": false
    }
  }' | jq '.'

echo ""
echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="

# Additional test with timing
echo ""
echo "⏱️  Performance Test: Measuring processing time"
echo "-----------------------------------"

start_time=$(date +%s)

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://coin68.com/tin-tuc/crypto-market-analysis/",
    "options": {
      "language": "vi",
      "format": "markdown"
    }
  }' | jq '.data.processingTime, .message'

end_time=$(date +%s)
total_time=$((end_time - start_time))

echo ""
echo "🕐 Total request time: ${total_time} seconds"
echo ""

echo "🔍 Tips for testing:"
echo "- Check the 'processingTime' field in responses"
echo "- Verify that articles are comprehensive (800-1200 words)"
echo "- Look for professional journalism structure with sections"
echo "- Check for expert quotes and Vietnamese market context"
echo "- Verify that duplicate URLs return existing results"
echo "- Monitor server logs for detailed processing information"
echo ""
echo "📊 To check saved articles in database:"
echo "- Connect to your database"
echo "- Query: SELECT * FROM processed_articles ORDER BY createdAt DESC;"
echo "" 