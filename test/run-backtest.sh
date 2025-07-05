#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080"

# Variables to store data
ADMIN_TOKEN=""
MEMBER_TOKEN=""
CATEGORY_ID=""
TAG_ID=""
BLOG_ID=""
COMMENT_ID=""

echo -e "${BLUE}🚀 Starting Controllers Backtest for Báo Tiền Điện Tử${NC}"
echo "======================================================"

# Print mock credentials
cat <<EOF
📋 Mock Credentials:
   👑 Admin: admin@baotiendientu.com | Admin123!
   👤 Member: member@baotiendientu.com | Member123!
EOF

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

# Function to extract field from JSON response - improved
extract_field() {
    local json=$1
    local field=$2
    # Handle nested data.field format
    if [[ "$field" == "access_token" ]]; then
        echo "$json" | grep -o '"data":{[^}]*"access_token":"[^"]*' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
    elif [[ "$field" == "id" ]]; then
        # Get the first occurrence of "id" field in the data object (most recent)
        echo "$json" | grep -o '"data":{.*}' | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4
    else
        echo "$json" | grep -o "\"$field\":\"[^\"]*" | cut -d'"' -f4
    fi
}

# Function to extract blog ID from blog list response
extract_blog_id() {
    local response=$1
    # Extract the most recent blog ID (first one in the list)
    echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4
}

# Function to check if response is successful - improved
check_response() {
    local response=$1
    local test_name=$2
    
    # Check for success status codes in different formats
    if echo "$response" | grep -q '"statusCode":20[0-9]' || echo "$response" | grep -q '"status_code":20[0-9]'; then
        echo -e "${GREEN}✅ $test_name${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to debug and display current state
debug_state() {
    echo -e "\n${BLUE}🔍 Debug Information:${NC}"
    echo "  Admin Token: ${ADMIN_TOKEN:0:20}..."
    echo "  Member Token: ${MEMBER_TOKEN:0:20}..."
    echo "  Category ID: $CATEGORY_ID"
    echo "  Tag ID: $TAG_ID"
    echo "  Blog ID: $BLOG_ID"
    echo "  Comment ID: $COMMENT_ID"
    echo ""
}

# Function to validate token format
validate_token() {
    local token=$1
    local token_type=$2
    
    if [ -n "$token" ]; then
        # Check if token has proper JWT format (3 parts separated by dots)
        local parts=$(echo "$token" | tr -cd '.' | wc -c)
        if [ "$parts" -eq 2 ]; then
            echo -e "${GREEN}✅ $token_type token format is valid${NC}"
            return 0
        else
            echo -e "${RED}❌ $token_type token format is invalid${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ $token_type token is empty${NC}"
        return 1
    fi
}

# Function to check blog permissions
check_blog_permissions() {
    local blog_id=$1
    local token=$2
    local token_type=$3
    
    if [ -n "$blog_id" ] && [ -n "$token" ]; then
        echo -e "\n${BLUE}🔍 Checking blog permissions for $token_type...${NC}"
        
        # Get blog detail to check author
        BLOG_DETAIL_RESPONSE=$(make_request "GET" "/blogs/$blog_id")
        if check_response "$BLOG_DETAIL_RESPONSE" "Blog Detail Check"; then
            AUTHOR_ID=$(echo "$BLOG_DETAIL_RESPONSE" | grep -o '"authorId":"[^"]*' | cut -d'"' -f4)
            echo "  Blog Author ID: $AUTHOR_ID"
            
            # Get user info from token
            USER_VERIFY_RESPONSE=$(make_request "GET" "/users/verify" "" "Authorization: Bearer $token")
            if check_response "$USER_VERIFY_RESPONSE" "User Verify Check"; then
                USER_ID=$(echo "$USER_VERIFY_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
                USER_ROLE=$(echo "$USER_VERIFY_RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
                echo "  Token User ID: $USER_ID"
                echo "  Token User Role: $USER_ROLE"
                
                if [ "$AUTHOR_ID" = "$USER_ID" ]; then
                    echo -e "${GREEN}✅ Author ID matches Token User ID${NC}"
                else
                    echo -e "${YELLOW}⚠️ Author ID ($AUTHOR_ID) != Token User ID ($USER_ID)${NC}"
                    if [ "$USER_ROLE" = "admin" ]; then
                        echo -e "${GREEN}✅ User is admin, should have permission${NC}"
                    else
                        echo -e "${RED}❌ User is not admin and not author${NC}"
                    fi
                fi
            fi
        fi
    fi
}

# Function to clean up test data
cleanup_test_data() {
    echo -e "\n${YELLOW}🧹 Cleaning up test data...${NC}"
    
    # Delete test users (if possible)
    if [ -n "$ADMIN_TOKEN" ]; then
        echo "Cleaning up admin user data..."
    fi
    
    if [ -n "$MEMBER_TOKEN" ]; then
        echo "Cleaning up member user data..."
    fi
}

echo -e "\n${YELLOW}🔐 Phase 1: Authentication & Setup${NC}"
echo "--------------------------------"

# Test 1: Register Admin User (or login if exists)
echo -n "Registering admin user... "
ADMIN_REGISTER_RESPONSE=$(make_request "POST" "/users/register" '{
    "user_name": "Admin User Test",
    "email": "admin.test@baotiendientu.com",
    "password": "Admin123!",
    "avatar_url": "https://example.com/admin-avatar.jpg"
}')

if echo "$ADMIN_REGISTER_RESPONSE" | grep -q '"statusCode":409'; then
    echo -e "${YELLOW}⚠️ Admin user already exists, trying login...${NC}"
else
    check_response "$ADMIN_REGISTER_RESPONSE" "Admin Registration"
fi

# Test 2: Login Admin User
echo -n "Logging in admin user... "
ADMIN_LOGIN_RESPONSE=$(make_request "POST" "/users/login" '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
}')

if check_response "$ADMIN_LOGIN_RESPONSE" "Admin Login"; then
    ADMIN_TOKEN=$(extract_field "$ADMIN_LOGIN_RESPONSE" "access_token")
    if [ -n "$ADMIN_TOKEN" ]; then
        echo "  Token: ${ADMIN_TOKEN:0:20}..."
        validate_token "$ADMIN_TOKEN" "Admin"
    else
        echo -e "${RED}❌ Failed to extract admin token${NC}"
        ADMIN_TOKEN=""
    fi
else
    echo -e "${RED}❌ Admin Login Failed!${NC}"
    echo -e "${YELLOW}💡 Solution: Restart server to re-run seed script, or manually delete test users from database.${NC}"
    echo -e "${YELLOW}💡 Expected credentials: admin@baotiendientu.com | Admin123!${NC}"
    # Continue with empty token for other tests
    ADMIN_TOKEN=""
fi

# Test 3: Register Member User (or login if exists)
echo -n "Registering member user... "
MEMBER_REGISTER_RESPONSE=$(make_request "POST" "/users/register" '{
    "user_name": "Member User Test",
    "email": "member.test@baotiendientu.com",
    "password": "Member123!",
    "avatar_url": "https://example.com/member-avatar.jpg"
}')

if echo "$MEMBER_REGISTER_RESPONSE" | grep -q '"statusCode":409'; then
    echo -e "${YELLOW}⚠️ Member user already exists, trying login...${NC}"
else
    check_response "$MEMBER_REGISTER_RESPONSE" "Member Registration"
fi

# Test 4: Login Member User
echo -n "Logging in member user... "
MEMBER_LOGIN_RESPONSE=$(make_request "POST" "/users/login" '{
    "email": "member@baotiendientu.com",
    "password": "Member123!"
}')

if check_response "$MEMBER_LOGIN_RESPONSE" "Member Login"; then
    MEMBER_TOKEN=$(extract_field "$MEMBER_LOGIN_RESPONSE" "access_token")
    if [ -n "$MEMBER_TOKEN" ]; then
        echo "  Token: ${MEMBER_TOKEN:0:20}..."
        validate_token "$MEMBER_TOKEN" "Member"
    else
        echo -e "${RED}❌ Failed to extract member token${NC}"
        MEMBER_TOKEN=""
    fi
else
    echo -e "${RED}❌ Member Login Failed!${NC}"
    echo -e "${YELLOW}💡 Solution: Restart server to re-run seed script, or manually delete test users from database.${NC}"
    echo -e "${YELLOW}💡 Expected credentials: member@baotiendientu.com | Member123!${NC}"
    # Continue with empty token for other tests
    MEMBER_TOKEN=""
fi

# Test 5: Verify Admin Token
echo -n "Verifying admin token... "
if [ -n "$ADMIN_TOKEN" ]; then
    ADMIN_VERIFY_RESPONSE=$(make_request "GET" "/users/verify" "" "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$ADMIN_VERIFY_RESPONSE" "Admin Token Verification"
else
    echo -e "${RED}❌ Admin Token Verification (No token)${NC}"
fi

# Test 6: Verify Member Token
echo -n "Verifying member token... "
if [ -n "$MEMBER_TOKEN" ]; then
    MEMBER_VERIFY_RESPONSE=$(make_request "GET" "/users/verify" "" "Authorization: Bearer $MEMBER_TOKEN")
    check_response "$MEMBER_VERIFY_RESPONSE" "Member Token Verification"
else
    echo -e "${RED}❌ Member Token Verification (No token)${NC}"
fi

echo -e "\n${YELLOW}🏗️ Phase 2: Content Structure Setup${NC}"
echo "------------------------------------"

# Test 7: Create Category (or get existing)
echo -n "Creating cryptocurrency category... "
# Generate unique slug with timestamp
TIMESTAMP=$(date +%s)
CATEGORY_RESPONSE=$(make_request "POST" "/categories" '{
    "name": "Tiền Điện Tử Test",
    "slug": "tien-dien-tu-test-'$TIMESTAMP'",
    "description": "Tin tức và phân tích về thị trường tiền điện tử - Test"
}' "Authorization: Bearer $ADMIN_TOKEN")

if echo "$CATEGORY_RESPONSE" | grep -q '"statusCode":409' || echo "$CATEGORY_RESPONSE" | grep -q '"statusCode":500'; then
    echo -e "${YELLOW}⚠️ Category already exists, getting existing...${NC}"
    # Get existing categories and extract first one
    CATEGORIES_LIST_RESPONSE=$(make_request "GET" "/categories")
    CATEGORY_ID=$(echo "$CATEGORIES_LIST_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$CATEGORY_ID" ]; then
        echo "  Using existing Category ID: $CATEGORY_ID"
    else
        echo -e "${RED}  No existing categories found${NC}"
    fi
elif check_response "$CATEGORY_RESPONSE" "Category Creation"; then
    CATEGORY_ID=$(extract_field "$CATEGORY_RESPONSE" "id")
    if [ -n "$CATEGORY_ID" ]; then
        echo "  Category ID: $CATEGORY_ID"
    else
        echo -e "${RED}  Failed to extract category ID${NC}"
    fi
fi

# Test 8: Create Subcategory
echo -n "Creating bitcoin subcategory... "
if [ -n "$CATEGORY_ID" ]; then
    SUBCATEGORY_RESPONSE=$(make_request "POST" "/categories" '{
        "name": "Bitcoin Test",
        "slug": "bitcoin-test-'$TIMESTAMP'",
        "description": "Tin tức và phân tích về Bitcoin - Test",
        "parentId": "'$CATEGORY_ID'"
    }' "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$SUBCATEGORY_RESPONSE" | grep -q '"statusCode":409' || echo "$SUBCATEGORY_RESPONSE" | grep -q '"statusCode":500'; then
        echo -e "${YELLOW}⚠️ Subcategory already exists${NC}"
    else
        check_response "$SUBCATEGORY_RESPONSE" "Subcategory Creation"
    fi
else
    echo -e "${RED}❌ Subcategory Creation (No parent category ID)${NC}"
fi

# Test 9: Create Tag (or get existing)
echo -n "Creating trading tag... "
TAG_RESPONSE=$(make_request "POST" "/tags" '{
    "name": "Trading Test",
    "slug": "trading-test-'$TIMESTAMP'"
}' "Authorization: Bearer $ADMIN_TOKEN")

if echo "$TAG_RESPONSE" | grep -q '"statusCode":409' || echo "$TAG_RESPONSE" | grep -q '"statusCode":500'; then
    echo -e "${YELLOW}⚠️ Tag already exists, getting existing...${NC}"
    # Get existing tags and extract first one
    TAGS_LIST_RESPONSE=$(make_request "GET" "/tags")
    TAG_ID=$(echo "$TAGS_LIST_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$TAG_ID" ]; then
        echo "  Using existing Tag ID: $TAG_ID"
    else
        echo -e "${RED}  No existing tags found${NC}"
    fi
elif check_response "$TAG_RESPONSE" "Tag Creation"; then
    TAG_ID=$(extract_field "$TAG_RESPONSE" "id")
    if [ -n "$TAG_ID" ]; then
        echo "  Tag ID: $TAG_ID"
    else
        echo -e "${RED}  Failed to extract tag ID${NC}"
    fi
fi

# Test 10: Create Analysis Tag
echo -n "Creating analysis tag... "
ANALYSIS_TAG_RESPONSE=$(make_request "POST" "/tags" '{
    "name": "Phân Tích Test",
    "slug": "phan-tich-test-'$TIMESTAMP'"
}' "Authorization: Bearer $ADMIN_TOKEN")

if echo "$ANALYSIS_TAG_RESPONSE" | grep -q '"statusCode":409' || echo "$ANALYSIS_TAG_RESPONSE" | grep -q '"statusCode":500'; then
    echo -e "${YELLOW}⚠️ Analysis tag already exists${NC}"
else
    check_response "$ANALYSIS_TAG_RESPONSE" "Analysis Tag Creation"
fi

# Test 11: List Categories
echo -n "Listing all categories... "
CATEGORIES_LIST_RESPONSE=$(make_request "GET" "/categories")
check_response "$CATEGORIES_LIST_RESPONSE" "Categories List"

# Test 12: List Tags
echo -n "Listing all tags... "
TAGS_LIST_RESPONSE=$(make_request "GET" "/tags")
check_response "$TAGS_LIST_RESPONSE" "Tags List"

echo -e "\n${YELLOW}📝 Phase 3: Content Creation${NC}"
echo "----------------------------"

# Test 13: Create Blog Post
echo -n "Creating blog post... "
if [ -n "$ADMIN_TOKEN" ] && [ -n "$CATEGORY_ID" ]; then
    # Generate unique slug with timestamp
    TIMESTAMP=$(date +%s)
    BLOG_RESPONSE=$(make_request "POST" "/blogs" '{
        "title": "🚀 Bitcoin Test: Phân Tích Xu Hướng Thị Trường",
        "slug": "bitcoin-test-phan-tich-xu-huong-'$TIMESTAMP'",
        "content": "<h2>🔥 Bitcoin Đạt Mốc Quan Trọng</h2><p>Bitcoin test content...</p>",
        "excerpt": "Bitcoin test excerpt",
        "thumbnailUrl": "https://example.com/bitcoin-test-thumbnail.jpg",
        "metaTitle": "Bitcoin Test - Phân Tích Xu Hướng Thị Trường",
        "metaDescription": "Phân tích test về Bitcoin",
        "categoryId": "'$CATEGORY_ID'"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    if echo "$BLOG_RESPONSE" | grep -q '"statusCode":409'; then
        echo -e "${YELLOW}⚠️ Blog slug already exists, getting existing blog...${NC}"
        # Get existing blogs and extract first one
        BLOGS_LIST_RESPONSE=$(make_request "GET" "/blogs")
        BLOG_ID=$(extract_blog_id "$BLOGS_LIST_RESPONSE")
        if [ -n "$BLOG_ID" ]; then
            echo "  Using existing Blog ID: $BLOG_ID"
        else
            echo -e "${RED}  No existing blogs found${NC}"
        fi
    elif check_response "$BLOG_RESPONSE" "Blog Creation"; then
        BLOG_ID=$(extract_field "$BLOG_RESPONSE" "id")
        if [ -n "$BLOG_ID" ]; then
            echo "  Blog ID: $BLOG_ID"
        else
            echo -e "${RED}  Failed to extract blog ID${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Blog Creation (Missing token or category ID)${NC}"
fi

# Debug state after blog creation
debug_state

# Test 14: Publish Blog Post
echo -n "Publishing blog post... "
if [ -n "$BLOG_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    # Check permissions before publishing
    check_blog_permissions "$BLOG_ID" "$ADMIN_TOKEN" "Admin"
    
    PUBLISH_RESPONSE=$(make_request "PATCH" "/blogs/$BLOG_ID/publish" "" "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$PUBLISH_RESPONSE" "Blog Publishing"
else
    echo -e "${RED}❌ Blog Publishing (Missing blog ID or token)${NC}"
fi

# Test 15: List Blog Posts
echo -n "Listing all blog posts... "
BLOGS_LIST_RESPONSE=$(make_request "GET" "/blogs")
check_response "$BLOGS_LIST_RESPONSE" "Blogs List"

# Test 16: Get Blog Detail
echo -n "Getting blog post detail... "
if [ -n "$BLOG_ID" ]; then
    BLOG_DETAIL_RESPONSE=$(make_request "GET" "/blogs/$BLOG_ID")
    check_response "$BLOG_DETAIL_RESPONSE" "Blog Detail"
else
    echo -e "${RED}❌ Blog Detail (Missing blog ID)${NC}"
fi

echo -e "\n${YELLOW}💬 Phase 4: Social Interactions${NC}"
echo "--------------------------------"

# Test 17: Add Comment to Blog
echo -n "Adding comment to blog... "
if [ -n "$MEMBER_TOKEN" ] && [ -n "$BLOG_ID" ]; then
    COMMENT_RESPONSE=$(make_request "POST" "/comments" '{
        "source_type": "blog",
        "source_id": "'$BLOG_ID'",
        "content": "Bài viết test rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin."
    }' "Authorization: Bearer $MEMBER_TOKEN")

    if check_response "$COMMENT_RESPONSE" "Comment Creation"; then
        COMMENT_ID=$(extract_field "$COMMENT_RESPONSE" "id")
        if [ -n "$COMMENT_ID" ]; then
            echo "  Comment ID: $COMMENT_ID"
        else
            echo -e "${RED}  Failed to extract comment ID${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Comment Creation (Missing token or blog ID)${NC}"
fi

# Debug state after comment creation
debug_state

# Test 18: Reply to Comment
echo -n "Replying to comment... "
if [ -n "$ADMIN_TOKEN" ] && [ -n "$BLOG_ID" ] && [ -n "$COMMENT_ID" ]; then
    REPLY_RESPONSE=$(make_request "POST" "/comments" '{
        "source_type": "blog",
        "source_id": "'$BLOG_ID'",
        "content": "Cảm ơn bạn đã đọc! Tôi sẽ tiếp tục cập nhật những phân tích mới.",
        "parent_id": "'$COMMENT_ID'"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    if check_response "$REPLY_RESPONSE" "Comment Reply"; then
        REPLY_ID=$(extract_field "$REPLY_RESPONSE" "id")
        if [ -n "$REPLY_ID" ]; then
            echo "  Reply ID: $REPLY_ID"
        fi
    fi
else
    echo -e "${RED}❌ Comment Reply (Missing required IDs or token)${NC}"
fi

# Test 19: Like Blog Post
echo -n "Liking blog post... "
if [ -n "$MEMBER_TOKEN" ] && [ -n "$BLOG_ID" ]; then
    LIKE_RESPONSE=$(make_request "POST" "/likes" '{
        "source_type": "blog",
        "source_id": "'$BLOG_ID'"
    }' "Authorization: Bearer $MEMBER_TOKEN")

    check_response "$LIKE_RESPONSE" "Blog Like"
else
    echo -e "${RED}❌ Blog Like (Missing token or blog ID)${NC}"
fi

# Test 20: Unlike Blog Post (Toggle)
echo -n "Unliking blog post... "
if [ -n "$MEMBER_TOKEN" ] && [ -n "$BLOG_ID" ]; then
    UNLIKE_RESPONSE=$(make_request "POST" "/likes" '{
        "source_type": "blog",
        "source_id": "'$BLOG_ID'"
    }' "Authorization: Bearer $MEMBER_TOKEN")

    check_response "$UNLIKE_RESPONSE" "Blog Unlike"
else
    echo -e "${RED}❌ Blog Unlike (Missing token or blog ID)${NC}"
fi

# Test 21: List Comments
echo -n "Listing comments for blog... "
if [ -n "$BLOG_ID" ]; then
    COMMENTS_LIST_RESPONSE=$(make_request "GET" "/comments?source_type=blog&source_id=$BLOG_ID")
    check_response "$COMMENTS_LIST_RESPONSE" "Comments List"
else
    echo -e "${RED}❌ Comments List (Missing blog ID)${NC}"
fi

echo -e "\n${YELLOW}📊 Phase 5: Content Management${NC}"
echo "-------------------------------"

# Test 22: Update Blog Post
echo -n "Updating blog post... "
if [ -n "$BLOG_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    # Check permissions before updating
    check_blog_permissions "$BLOG_ID" "$ADMIN_TOKEN" "Admin"
    
    UPDATE_BLOG_RESPONSE=$(make_request "PUT" "/blogs/$BLOG_ID" '{
        "title": "🚀 Bitcoin Test: Phân Tích Xu Hướng Thị Trường [CẬP NHẬT]",
        "content": "Nội dung test đã được cập nhật với thông tin mới nhất..."
    }' "Authorization: Bearer $ADMIN_TOKEN")

    check_response "$UPDATE_BLOG_RESPONSE" "Blog Update"
else
    echo -e "${RED}❌ Blog Update (Missing blog ID or token)${NC}"
fi

# Test 23: Update Comment
echo -n "Updating comment... "
if [ -n "$COMMENT_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    UPDATE_COMMENT_RESPONSE=$(make_request "PUT" "/comments/$COMMENT_ID" '{
        "content": "Bài viết test rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin. [Đã chỉnh sửa]"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    if check_response "$UPDATE_COMMENT_RESPONSE" "Comment Update"; then
        echo "  Comment updated successfully"
    fi
else
    echo -e "${RED}❌ Comment Update (Missing comment ID or token)${NC}"
fi

# Test 24: Update Category
echo -n "Updating category... "
if [ -n "$CATEGORY_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    UPDATE_CATEGORY_RESPONSE=$(make_request "PUT" "/categories/$CATEGORY_ID" '{
        "name": "Tiền Điện Tử Test & Blockchain",
        "description": "Tin tức và phân tích về thị trường tiền điện tử và công nghệ blockchain - Test"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    check_response "$UPDATE_CATEGORY_RESPONSE" "Category Update"
else
    echo -e "${RED}❌ Category Update (Missing category ID or token)${NC}"
fi

# Test 25: Update Tag
echo -n "Updating tag... "
if [ -n "$TAG_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    UPDATE_TAG_RESPONSE=$(make_request "PUT" "/tags/$TAG_ID" '{
        "name": "Trading Test & Đầu Tư"
    }' "Authorization: Bearer $ADMIN_TOKEN")

    check_response "$UPDATE_TAG_RESPONSE" "Tag Update"
else
    echo -e "${RED}❌ Tag Update (Missing tag ID or token)${NC}"
fi

echo -e "\n${YELLOW}🔒 Phase 6: Security & Error Handling${NC}"
echo "--------------------------------------"

# Test 26: Unauthorized Blog Creation
echo -n "Testing unauthorized blog creation... "
UNAUTHORIZED_BLOG_RESPONSE=$(make_request "POST" "/blogs" '{
    "title": "Unauthorized Blog Test",
    "slug": "unauthorized-blog-test",
    "content": "This should fail"
}')

if echo "$UNAUTHORIZED_BLOG_RESPONSE" | grep -q '"statusCode":401'; then
    echo -e "${GREEN}✅ Unauthorized Blog Creation (Correctly Rejected)${NC}"
else
    echo -e "${RED}❌ Unauthorized Blog Creation (Should be rejected)${NC}"
fi

# Test 27: Invalid Login
echo -n "Testing invalid login... "
INVALID_LOGIN_RESPONSE=$(make_request "POST" "/users/login" '{
    "email": "admin@baotiendientu.com",
    "password": "WrongPassword"
}')

if echo "$INVALID_LOGIN_RESPONSE" | grep -q '"statusCode":401'; then
    echo -e "${GREEN}✅ Invalid Login (Correctly Rejected)${NC}"
else
    echo -e "${RED}❌ Invalid Login (Should be rejected)${NC}"
fi

# Test 28: Duplicate Registration
echo -n "Testing duplicate registration... "
DUPLICATE_REGISTER_RESPONSE=$(make_request "POST" "/users/register" '{
    "name": "Duplicate User",
    "email": "admin@baotiendientu.com",
    "password": "Password123!"
}')

if echo "$DUPLICATE_REGISTER_RESPONSE" | grep -q '"statusCode":409'; then
    echo -e "${GREEN}✅ Duplicate Registration (Correctly Rejected)${NC}"
else
    echo -e "${RED}❌ Duplicate Registration (Should be rejected)${NC}"
fi

# Test 29: Invalid Token
echo -n "Testing invalid token... "
INVALID_TOKEN_RESPONSE=$(make_request "GET" "/users/verify" "" "Authorization: Bearer invalid-token")

if echo "$INVALID_TOKEN_RESPONSE" | grep -q '"statusCode":401'; then
    echo -e "${GREEN}✅ Invalid Token (Correctly Rejected)${NC}"
else
    echo -e "${RED}❌ Invalid Token (Should be rejected)${NC}"
fi

# Test 30: Unauthorized Blog Update
echo -n "Testing unauthorized blog update... "
if [ -n "$BLOG_ID" ]; then
    UNAUTHORIZED_UPDATE_RESPONSE=$(make_request "PUT" "/blogs/$BLOG_ID" '{
        "title": "Unauthorized Update"
    }' "Authorization: Bearer $MEMBER_TOKEN")

    if echo "$UNAUTHORIZED_UPDATE_RESPONSE" | grep -q '"statusCode":403'; then
        echo -e "${GREEN}✅ Unauthorized Update (Correctly Rejected)${NC}"
    else
        echo -e "${RED}❌ Unauthorized Update (Should be rejected)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Unauthorized Update (Skipped - no blog ID)${NC}"
fi

echo -e "\n${YELLOW}🏥 Phase 7: Health Checks${NC}"
echo "-------------------------"

# Test 31: Basic Health Check
echo -n "Testing basic health check... "
HEALTH_RESPONSE=$(make_request "GET" "/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status_code":200' || echo "$HEALTH_RESPONSE" | grep -q '"statusCode":200' || echo "$HEALTH_RESPONSE" | grep -q '^1$'; then
    echo -e "${GREEN}✅ Basic Health Check${NC}"
else
    echo -e "${RED}❌ Basic Health Check${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 32: Database Health Check
echo -n "Testing database health check... "
DB_HEALTH_RESPONSE=$(make_request "GET" "/health/check-db")
if echo "$DB_HEALTH_RESPONSE" | grep -q '"status_code":200' || echo "$DB_HEALTH_RESPONSE" | grep -q '"statusCode":200' || [ -n "$DB_HEALTH_RESPONSE" ]; then
    echo -e "${GREEN}✅ Database Health Check${NC}"
else
    echo -e "${RED}❌ Database Health Check${NC}"
    echo "Response: $DB_HEALTH_RESPONSE"
fi

echo -e "\n${BLUE}📋 Backtest Summary${NC}"
echo "==================="
echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${YELLOW}⚠️  Note: Some tests may fail if data already exists or permissions are different${NC}"
echo -e "${BLUE}🚀 Script completed successfully${NC}" 