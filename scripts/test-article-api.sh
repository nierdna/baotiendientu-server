#!/bin/bash

# Test Article API
# Usage: ./test-article-api.sh

BASE_URL="http://localhost:3000"

echo "🧪 Testing Article API..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make HTTP request and show result
test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "\n${YELLOW}📡 Testing: $description${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X $method \
        -H "Content-Type: application/json" \
        "$BASE_URL$endpoint")
    
    # Extract HTTP status code
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    # Extract response body
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_status)${NC}"
    else
        echo -e "${RED}❌ Failed (HTTP $http_status)${NC}"
    fi
    
    echo "Response:"
    echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
    echo "=================================="
}

# Test URLs to crawl
TEST_URLS=(
    "https://coin68.com/tin-tuc/bitcoin-tang-manh/"
    "https://coin68.com/tin-tuc/ethereum-phat-trien/"
    "/tin-tuc/solana-ecosystem/"
)

echo -e "\n${YELLOW}🔍 Testing Article URL Crawling...${NC}"

for url in "${TEST_URLS[@]}"; do
    # URL encode the parameter
    encoded_url=$(printf '%s\n' "$url" | jq -sRr @uri)
    test_api "GET" "/articles/crawl-url?url=$encoded_url" "Crawl article: $url"
    
    # Add delay between requests
    sleep 2
done

# Test with missing URL parameter
test_api "GET" "/articles/crawl-url" "Test missing URL parameter (should fail)"

echo -e "\n${YELLOW}🔍 Testing HTML Download API...${NC}"

# Test download HTML file
DOWNLOAD_URL="https://coin68.com/tin-tuc/bitcoin-tang-manh/"
encoded_download_url=$(printf '%s\n' "$DOWNLOAD_URL" | jq -sRr @uri)

echo -e "\n${YELLOW}📁 Testing HTML file download...${NC}"
echo "URL: $DOWNLOAD_URL"
echo "Downloading to: article-download.html"

# Download HTML file
curl -s "$BASE_URL/articles/download-html?url=$encoded_download_url" \
  -o "article-download.html" \
  -w "HTTP Status: %{http_code}\nDownload time: %{time_total}s\nFile size: %{size_download} bytes\n"

if [ -f "article-download.html" ]; then
    file_size=$(wc -c < "article-download.html")
    echo -e "${GREEN}✅ HTML file downloaded successfully${NC}"
    echo "File: article-download.html"
    echo "Size: $file_size bytes"
    
    # Show first few lines of the HTML file
    echo -e "\n${YELLOW}📄 First 5 lines of downloaded HTML:${NC}"
    head -5 "article-download.html"
    echo "..."
else
    echo -e "${RED}❌ HTML file download failed${NC}"
fi

# Test download with custom filename
echo -e "\n${YELLOW}📁 Testing custom filename download...${NC}"
curl -s "$BASE_URL/articles/download-html?url=$encoded_download_url&filename=custom-bitcoin-article" \
  -o "custom-bitcoin-article.html" \
  -w "HTTP Status: %{http_code}\n"

if [ -f "custom-bitcoin-article.html" ]; then
    echo -e "${GREEN}✅ Custom filename download successful${NC}"
    echo "File: custom-bitcoin-article.html"
else
    echo -e "${RED}❌ Custom filename download failed${NC}"
fi

echo -e "\n${GREEN}🎉 Article API testing completed!${NC}"
echo -e "\n${YELLOW}📋 API Endpoints:${NC}"
echo "1. GET /articles/crawl-url?url=<article_url> - Crawl full HTML content (JSON response)"
echo "2. GET /articles/download-html?url=<article_url>&filename=<optional> - Download HTML as file"

echo -e "\n${YELLOW}💡 Usage Examples:${NC}"
echo "# Get JSON response:"
echo "curl 'http://localhost:3000/articles/crawl-url?url=https://coin68.com/tin-tuc/bitcoin-tang-manh/'"
echo ""
echo "# Download HTML file:"
echo "curl 'http://localhost:3000/articles/download-html?url=https://coin68.com/tin-tuc/bitcoin-tang-manh/' -o article.html"
echo ""
echo "# Download with custom filename:"
echo "curl 'http://localhost:3000/articles/download-html?url=https://coin68.com/tin-tuc/bitcoin-tang-manh/&filename=bitcoin-news' -o bitcoin-news.html"

echo -e "\n${YELLOW}📝 Response Format:${NC}"
echo "{"
echo "  \"statusCode\": 200,"
echo "  \"message\": \"Article HTML crawled successfully\","
echo "  \"data\": {"
echo "    \"url\": \"https://coin68.com/tin-tuc/bitcoin-tang-manh/\","
echo "    \"htmlContent\": \"<!DOCTYPE html><html>...complete HTML...</html>\","
echo "    \"htmlLength\": 45820,"
echo "    \"crawlTime\": 3500"
echo "  },"
echo "  \"timestamp\": \"2023-06-15T10:30:00Z\""
echo "}" 