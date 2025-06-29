#!/bin/bash

# Test script for Process with AI API
# This script tests the POST /articles/process-with-ai endpoint

BASE_URL="http://localhost:3000"
API_ENDPOINT="/articles/process-with-ai"

echo "🤖 Testing Process with AI API..."
echo "=================================="

# Test URLs
declare -a TEST_URLS=(
    "https://coin68.com/tin-tuc/bitcoin-tang-manh-len-42000-usd-trong-boi-canh-fed-cat-giam-lai-suat/"
    "https://coin68.com/tin-tuc/ethereum-ethereum-classic-tang-manh/"
    "https://coin68.com/tin-tuc/solana-sol-tang-hon-20-trong-tuan/"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Basic processing with default options
echo -e "\n${BLUE}Test 1: Basic processing with default options${NC}"
echo "URL: ${TEST_URLS[0]}"

response1=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${TEST_URLS[0]}\"
  }")

echo "Response:"
echo "$response1" | jq '.'

# Check if response contains required fields including image
if echo "$response1" | jq -e '.data.title' > /dev/null && \
   echo "$response1" | jq -e '.data.content' > /dev/null && \
   echo "$response1" | jq -e '.data.image' > /dev/null; then
    echo -e "${GREEN}✅ Test 1 PASSED - All required fields present (including image)${NC}"
else
    echo -e "${RED}❌ Test 1 FAILED - Missing required fields${NC}"
fi

# Test 2: Processing with extract-only option
echo -e "\n${BLUE}Test 2: Extract-only processing${NC}"
echo "URL: ${TEST_URLS[1]}"

response2=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${TEST_URLS[1]}\",
    \"options\": {
      \"extractOnly\": true,
      \"language\": \"vi\",
      \"format\": \"html\"
    }
  }")

echo "Response:"
echo "$response2" | jq '.'

# Check extract-only response
if echo "$response2" | jq -e '.data.title' > /dev/null && \
   echo "$response2" | jq -e '.data.content' > /dev/null; then
    echo -e "${GREEN}✅ Test 2 PASSED - Extract-only processing successful${NC}"
else
    echo -e "${RED}❌ Test 2 FAILED - Extract-only processing failed${NC}"
fi

# Test 3: Processing with AI (comprehensive)
echo -e "\n${BLUE}Test 3: Full AI processing${NC}"
echo "URL: ${TEST_URLS[2]}"

response3=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${TEST_URLS[2]}\",
    \"options\": {
      \"extractOnly\": false,
      \"language\": \"vi\",
      \"format\": \"markdown\"
    }
  }")

echo "Response:"
echo "$response3" | jq '.'

# Check AI processing response
if echo "$response3" | jq -e '.data.summary' > /dev/null && \
   echo "$response3" | jq -e '.data.tags' > /dev/null && \
   echo "$response3" | jq -e '.data.image' > /dev/null; then
    echo -e "${GREEN}✅ Test 3 PASSED - AI processing with summary, tags, and image${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED - AI processing incomplete${NC}"
fi

# Test 4: Duplicate processing (should return existing)
echo -e "\n${BLUE}Test 4: Duplicate processing check${NC}"
echo "URL: ${TEST_URLS[0]} (same as Test 1)"

response4=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${TEST_URLS[0]}\"
  }")

echo "Response:"
echo "$response4" | jq '.'

# Check if it returns existing article
if echo "$response4" | jq -e '.message' | grep -q "already processed"; then
    echo -e "${GREEN}✅ Test 4 PASSED - Duplicate detection working${NC}"
else
    echo -e "${YELLOW}⚠️  Test 4 WARNING - No duplicate detection or new processing${NC}"
fi

# Test 5: Invalid URL
echo -e "\n${BLUE}Test 5: Invalid URL handling${NC}"

response5=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://invalid-url-that-does-not-exist.com/article\"
  }")

echo "Response:"
echo "$response5" | jq '.'

# Check error handling
if echo "$response5" | jq -e '.statusCode' | grep -q "400"; then
    echo -e "${GREEN}✅ Test 5 PASSED - Error handling working${NC}"
else
    echo -e "${RED}❌ Test 5 FAILED - Error handling not working${NC}"
fi

# Test 6: Missing URL
echo -e "\n${BLUE}Test 6: Missing URL validation${NC}"

response6=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{}")

echo "Response:"
echo "$response6" | jq '.'

# Check validation
if echo "$response6" | jq -e '.statusCode' | grep -q "400"; then
    echo -e "${GREEN}✅ Test 6 PASSED - Validation working${NC}"
else
    echo -e "${RED}❌ Test 6 FAILED - Validation not working${NC}"
fi

# Test 7: Processing time analysis
echo -e "\n${BLUE}Test 7: Processing time analysis${NC}"

start_time=$(date +%s%3N)
response7=$(curl -s -X POST "${BASE_URL}${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://coin68.com/tin-tuc/bitcoin-tang-manh/\",
    \"options\": {
      \"extractOnly\": false,
      \"language\": \"vi\",
      \"format\": \"markdown\"
    }
  }")
end_time=$(date +%s%3N)

processing_time=$((end_time - start_time))
echo "Total request time: ${processing_time}ms"

# Extract processing time from response
if echo "$response7" | jq -e '.data.processingTime' > /dev/null; then
    server_processing_time=$(echo "$response7" | jq -r '.data.processingTime')
    echo "Server processing time: ${server_processing_time}ms"
    echo -e "${GREEN}✅ Test 7 PASSED - Processing time tracking working${NC}"
else
    echo -e "${RED}❌ Test 7 FAILED - Processing time not tracked${NC}"
fi

echo -e "\n${BLUE}Summary${NC}"
echo "========"
echo "✅ Basic processing test"
echo "✅ Extract-only processing test"  
echo "✅ AI processing with summary/tags/image test"
echo "✅ Duplicate detection test"
echo "✅ Error handling test"
echo "✅ Validation test"
echo "✅ Processing time test"

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
echo -e "${YELLOW}💡 Check the responses above for detailed results${NC}" 