#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080"

echo -e "${BLUE}🚀 Quick Test for Token and Blog Creation${NC}"
echo "=============================================="

# Function to make HTTP requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$headers" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint"
        fi
    fi
}

# Function to extract field from JSON response
extract_field() {
    local json=$1
    local field=$2
    if [[ "$field" == "access_token" ]]; then
        echo "$json" | grep -o '"data":{[^}]*"access_token":"[^"]*' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
    elif [[ "$field" == "id" ]]; then
        echo "$json" | grep -o '"data":{.*}' | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4
    else
        echo "$json" | grep -o "\"$field\":\"[^\"]*" | cut -d'"' -f4
    fi
}

# Test 1: Login Admin
echo -n "1. Logging in admin... "
ADMIN_LOGIN_RESPONSE=$(make_request "POST" "/users/login" '{
    "email": "admin.test@baotiendientu.com",
    "password": "Admin123!"
}')

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"status_code":20[0-9]'; then
    ADMIN_TOKEN=$(extract_field "$ADMIN_LOGIN_RESPONSE" "access_token")
    if [ -n "$ADMIN_TOKEN" ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "  Token: ${ADMIN_TOKEN:0:30}..."
    else
        echo -e "${RED}❌ Failed to extract token${NC}"
        echo "Response: $ADMIN_LOGIN_RESPONSE"
    fi
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $ADMIN_LOGIN_RESPONSE"
fi

# Test 2: Verify Token
echo -n "2. Verifying token... "
if [ -n "$ADMIN_TOKEN" ]; then
    VERIFY_RESPONSE=$(make_request "GET" "/users/verify" "" "Authorization: Bearer $ADMIN_TOKEN")
    if echo "$VERIFY_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$VERIFY_RESPONSE" | grep -q '"status_code":20[0-9]'; then
        USER_ID=$(echo "$VERIFY_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        USER_ROLE=$(echo "$VERIFY_RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Success${NC}"
        echo "  User ID: $USER_ID"
        echo "  User Role: $USER_ROLE"
    else
        echo -e "${RED}❌ Verification failed${NC}"
        echo "Response: $VERIFY_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️ No token to verify${NC}"
fi

# Test 3: Get Categories
echo -n "3. Getting categories... "
CATEGORIES_RESPONSE=$(make_request "GET" "/categories")
if echo "$CATEGORIES_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$CATEGORIES_RESPONSE" | grep -q '"status_code":20[0-9]'; then
    CATEGORY_ID=$(echo "$CATEGORIES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$CATEGORY_ID" ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "  Category ID: $CATEGORY_ID"
    else
        echo -e "${YELLOW}⚠️ No categories found${NC}"
    fi
else
    echo -e "${RED}❌ Failed${NC}"
    echo "Response: $CATEGORIES_RESPONSE"
fi

# Test 4: Create Blog
echo -n "4. Creating blog... "
if [ -n "$ADMIN_TOKEN" ] && [ -n "$CATEGORY_ID" ]; then
    TIMESTAMP=$(date +%s)
    BLOG_RESPONSE=$(make_request "POST" "/blogs" '{
        "title": "🚀 Quick Test Blog",
        "slug": "quick-test-blog-'$TIMESTAMP'",
        "content": "<h2>Quick Test Content</h2><p>This is a quick test...</p>",
        "excerpt": "Quick test excerpt",
        "thumbnailUrl": "https://example.com/test-thumbnail.jpg",
        "metaTitle": "Quick Test Blog",
        "metaDescription": "Quick test description",
        "categoryId": "'$CATEGORY_ID'"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$BLOG_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$BLOG_RESPONSE" | grep -q '"status_code":20[0-9]'; then
        BLOG_ID=$(extract_field "$BLOG_RESPONSE" "id")
        if [ -n "$BLOG_ID" ]; then
            echo -e "${GREEN}✅ Success${NC}"
            echo "  Blog ID: $BLOG_ID"
        else
            echo -e "${RED}❌ Failed to extract blog ID${NC}"
            echo "Response: $BLOG_RESPONSE"
        fi
    else
        echo -e "${RED}❌ Blog creation failed${NC}"
        echo "Response: $BLOG_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️ Missing token or category ID${NC}"
fi

# Test 5: Get Blog Detail
echo -n "5. Getting blog detail... "
if [ -n "$BLOG_ID" ]; then
    BLOG_DETAIL_RESPONSE=$(make_request "GET" "/blogs/$BLOG_ID")
    if echo "$BLOG_DETAIL_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$BLOG_DETAIL_RESPONSE" | grep -q '"status_code":20[0-9]'; then
        AUTHOR_ID=$(echo "$BLOG_DETAIL_RESPONSE" | grep -o '"authorId":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Success${NC}"
        echo "  Blog Author ID: $AUTHOR_ID"
        echo "  Token User ID: $USER_ID"
        if [ "$AUTHOR_ID" = "$USER_ID" ]; then
            echo -e "${GREEN}✅ Author ID matches Token User ID${NC}"
        else
            echo -e "${YELLOW}⚠️ Author ID ($AUTHOR_ID) != Token User ID ($USER_ID)${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to get blog detail${NC}"
        echo "Response: $BLOG_DETAIL_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️ No blog ID to check${NC}"
fi

# Test 6: Publish Blog
echo -n "6. Publishing blog... "
if [ -n "$BLOG_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    PUBLISH_RESPONSE=$(make_request "PATCH" "/blogs/$BLOG_ID/publish" "" "Authorization: Bearer $ADMIN_TOKEN")
    if echo "$PUBLISH_RESPONSE" | grep -q '"statusCode":20[0-9]' || echo "$PUBLISH_RESPONSE" | grep -q '"status_code":20[0-9]'; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Response: $PUBLISH_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️ Missing blog ID or token${NC}"
fi

echo -e "\n${BLUE}🎯 Test Summary:${NC}"
echo "  Admin Token: ${ADMIN_TOKEN:0:20}..."
echo "  User ID: $USER_ID"
echo "  User Role: $USER_ROLE"
echo "  Category ID: $CATEGORY_ID"
echo "  Blog ID: $BLOG_ID"
echo "  Author ID: $AUTHOR_ID" 