# API Documentation for User (Member)

## Credentials
- **Email:** `member@baotiendientu.com`
- **Password:** `Member123!`

---

## 1. Đăng ký tài khoản

**Endpoint:** `POST /users/register`

**Request:**
```bash
curl -X POST http://localhost:8080/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "Test User",
    "email": "testuser@example.com",
    "password": "Test123!",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "user_name": "Test User",
    "email": "testuser@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "member"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 2. Đăng nhập

**Endpoint:** `POST /users/login`

**Request:**
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@baotiendientu.com",
    "password": "Member123!"
  }'
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 3. Lấy thông tin user hiện tại

**Endpoint:** `GET /users/verify`

**Request:**
```bash
curl -X GET http://localhost:8080/users/verify \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "User verified",
  "data": {
    "id": "9036d53e-a1b0-4203-b505-f75282e03ac8",
    "user_name": "Test Member",
    "email": "member@baotiendientu.com",
    "role": "member"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 4. Xem danh sách blog

**Endpoint:** `GET /blogs?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:8080/blogs?page=1&limit=10"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blogs retrieved successfully",
  "data": [
    {
      "id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
      "title": "Bản tin thị trường Crypto tháng 7/2025",
      "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
      "content": "Thị trường crypto đang có những biến động mạnh...",
      "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
      "author": {
        "id": "ce88afd5-0cf0-4f16-b683-0de615f95946",
        "user_name": "System Administrator"
      },
      "category": {
        "id": "35a892a4-0732-4dfb-84af-77fbbd898746",
        "name": "Crypto"
      },
      "is_published": true,
      "view_count": 10,
      "like_count": 2,
      "created_at": "2025-07-05T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "take": 10,
    "total": 100,
    "total_pages": 10
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 5. Xem chi tiết blog

**Endpoint:** `GET /blogs/{id}`

**Request:**
```bash
curl -X GET http://localhost:8080/blogs/1f16a072-ac6e-41d3-85c3-7168c6ec08c9
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blog retrieved successfully",
  "data": {
    "id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "author": {
      "id": "ce88afd5-0cf0-4f16-b683-0de615f95946",
      "user_name": "System Administrator"
    },
    "category": {
      "id": "35a892a4-0732-4dfb-84af-77fbbd898746",
      "name": "Crypto"
    },
    "is_published": true,
    "view_count": 11,
    "like_count": 2,
    "created_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 6. Bình luận blog

**Endpoint:** `POST /comments`

**Request:**
```bash
curl -X POST http://localhost:8080/comments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "blog",
    "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
    "content": "Bài viết rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin."
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Comment created successfully",
  "data": {
    "id": "comment-uuid",
    "content": "Bài viết rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin.",
    "user_id": "9036d53e-a1b0-4203-b505-f75282e03ac8",
    "source_type": "blog",
    "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
    "created_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 7. Trả lời bình luận

**Endpoint:** `POST /comments`

**Request:**
```bash
curl -X POST http://localhost:8080/comments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "blog",
    "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
    "content": "Cảm ơn bạn đã đọc! Tôi sẽ tiếp tục cập nhật những phân tích mới.",
    "parent_id": "comment-uuid"
  }'
```

---

## 8. Like/Unlike blog

**Endpoint:** `POST /likes`

**Request:**
```bash
curl -X POST http://localhost:8080/likes \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "blog",
    "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9"
  }'
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Like toggled successfully",
  "data": {
    "liked": true,
    "like_count": 3
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 9. Xem danh sách bình luận của blog

**Endpoint:** `GET /comments?source_type=blog&source_id=<blog_id>`

**Request:**
```bash
curl -X GET "http://localhost:8080/comments?source_type=blog&source_id=1f16a072-ac6e-41d3-85c3-7168c6ec08c9"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "comment-uuid",
      "content": "Bài viết rất hay!",
      "user_id": "9036d53e-a1b0-4203-b505-f75282e03ac8",
      "source_type": "blog",
      "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
      "created_at": "2025-07-05T10:00:00Z"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 10. Xem danh sách category

**Endpoint:** `GET /categories`

**Request:**
```bash
curl -X GET http://localhost:8080/categories
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "35a892a4-0732-4dfb-84af-77fbbd898746",
      "name": "Crypto",
      "slug": "crypto",
      "description": "Tin tức và phân tích về thị trường crypto"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 11. Xem danh sách tag

**Endpoint:** `GET /tags`

**Request:**
```bash
curl -X GET http://localhost:8080/tags
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Tags retrieved successfully",
  "data": [
    {
      "id": "b2362d05-e3cc-4252-b506-645917b4c805",
      "name": "Phân tích kỹ thuật",
      "slug": "phan-tich-ky-thuat"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 12. Sửa bình luận của mình

**Endpoint:** `PUT /comments/{id}`

**Request:**
```bash
curl -X PUT http://localhost:8080/comments/comment-uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bài viết rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin. [Đã chỉnh sửa]"
  }'
```

---

## 13. Xóa bình luận của mình

**Endpoint:** `DELETE /comments/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/comments/comment-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

## Lưu ý quan trọng

1. **Authentication:** Các request cần đăng nhập phải gửi header:
   ```
   Authorization: Bearer <access_token>
   ```

2. **Permissions:** User chỉ có thể sửa/xóa bình luận của chính mình

3. **Like/Unlike:** Gọi cùng endpoint để toggle like

4. **Pagination:** Sử dụng query params `page` và `limit` cho danh sách

5. **Testing:** Dùng curl để test trước khi tích hợp vào frontend 