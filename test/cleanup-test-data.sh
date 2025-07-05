#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning up test data for Báo Tiền Điện Tử${NC}"
echo "================================================="

# Function to make HTTP requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            curl -s -X "$method" "http://localhost:8080$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data"
        else
            curl -s -X "$method" "http://localhost:8080$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
    else
        if [ -n "$headers" ]; then
            curl -s -X "$method" "http://localhost:8080$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers"
        else
            curl -s -X "$method" "http://localhost:8080$endpoint" \
                -H "Content-Type: application/json"
        fi
    fi
}

# Function to check response
check_response() {
    local response=$1
    local test_name=$2
    
    if echo "$response" | grep -q '"statusCode":200\|"statusCode":201'; then
        echo -e "${GREEN}✅ $test_name${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to extract field from JSON response
extract_field() {
    local response=$1
    local field=$2
    echo "$response" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4
}

echo -e "\n${YELLOW}🔐 Getting admin token...${NC}"
# Try to get admin token for cleanup operations
ADMIN_LOGIN_RESPONSE=$(make_request "POST" "/users/login" '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
}')

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"statusCode":200'; then
    ADMIN_TOKEN=$(extract_field "$ADMIN_LOGIN_RESPONSE" "access_token")
    echo -e "${GREEN}✅ Admin token obtained${NC}"
else
    echo -e "${YELLOW}⚠️ Could not get admin token, some cleanup operations may fail${NC}"
    ADMIN_TOKEN=""
fi

echo -e "\n${YELLOW}🗑️ Cleaning up test blogs...${NC}"
# List of known test blog IDs to delete
TEST_BLOG_IDS=(
    "6394b4d0-ba02-41cf-bc6b-5db39007a0e3"
    "6b53e578-faa4-4f74-ac8c-6e5e516e905c"
    "57cefc52-d347-4c33-8537-1dc4a4d5ad2b"
    "c644a67e-6c4b-4f5a-99fe-1c20787c88f4"
)

for blog_id in "${TEST_BLOG_IDS[@]}"; do
    echo -n "Deleting blog $blog_id... "
    if [ -n "$ADMIN_TOKEN" ]; then
        DELETE_RESPONSE=$(make_request "DELETE" "/blogs/$blog_id" "" "Authorization: Bearer $ADMIN_TOKEN")
        if echo "$DELETE_RESPONSE" | grep -q '"statusCode":200'; then
            echo -e "${GREEN}✅ Deleted${NC}"
        else
            echo -e "${YELLOW}⚠️ (may not exist)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ (no admin token)${NC}"
    fi
done

echo -e "\n${YELLOW}🗑️ Cleaning up test categories...${NC}"
# Get and delete test categories
if [ -n "$ADMIN_TOKEN" ]; then
    CATEGORIES_RESPONSE=$(make_request "GET" "/categories")
    if echo "$CATEGORIES_RESPONSE" | grep -q '"statusCode":200'; then
        # Extract category IDs and delete them
        echo "$CATEGORIES_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | while read category_id; do
            echo -n "Deleting category $category_id... "
            DELETE_RESPONSE=$(make_request "DELETE" "/categories/$category_id" "" "Authorization: Bearer $ADMIN_TOKEN")
            if echo "$DELETE_RESPONSE" | grep -q '"statusCode":200'; then
                echo -e "${GREEN}✅ Deleted${NC}"
            else
                echo -e "${YELLOW}⚠️ (may not exist)${NC}"
            fi
        done
    fi
fi

echo -e "\n${YELLOW}🗑️ Cleaning up test tags...${NC}"
# Get and delete test tags
if [ -n "$ADMIN_TOKEN" ]; then
    TAGS_RESPONSE=$(make_request "GET" "/tags")
    if echo "$TAGS_RESPONSE" | grep -q '"statusCode":200'; then
        # Extract tag IDs and delete them
        echo "$TAGS_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | while read tag_id; do
            echo -n "Deleting tag $tag_id... "
            DELETE_RESPONSE=$(make_request "DELETE" "/tags/$tag_id" "" "Authorization: Bearer $ADMIN_TOKEN")
            if echo "$DELETE_RESPONSE" | grep -q '"statusCode":200'; then
                echo -e "${GREEN}✅ Deleted${NC}"
            else
                echo -e "${YELLOW}⚠️ (may not exist)${NC}"
            fi
        done
    fi
fi

echo -e "\n${YELLOW}🗑️ Cleaning up test users...${NC}"
echo -e "${YELLOW}Note: User deletion may not be available in the API${NC}"
echo -e "${YELLOW}Test users will remain: admin@baotiendientu.com, member@baotiendientu.com${NC}"
echo -e "${YELLOW}💡 To completely reset, restart server to re-run seed script${NC}"

echo -e "\n${GREEN}✅ Cleanup completed!${NC}"
echo -e "${BLUE}🚀 Now you can run: ./test/run-backtest.sh${NC}"
echo -e "${YELLOW}💡 If login still fails, restart server to re-run seed script${NC}" 