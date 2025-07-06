# API Documentation for Admin

## Credentials
- **Email:** `admin@baotiendientu.com`
- **Password:** `Admin123!`

---

## 1. Đăng nhập Admin

**Endpoint:** `POST /users/login`

**Request:**
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
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

> **Lưu ý:** Lưu `access_token` để sử dụng cho các request khác

---

## 2. Lấy thông tin tài khoản admin

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
    "id": "ce88afd5-0cf0-4f16-b683-0de615f95946",
    "user_name": "System Administrator",
    "email": "admin@baotiendientu.com",
    "role": "admin"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 3. Quản lý Blog

### 3.1. Tạo blog mới

**Endpoint:** `POST /blogs`

**Request:**
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "category": {"id": "category-uuid", "name": "Cryptocurrency", "slug": "cryptocurrency", "description": "Articles about cryptocurrency"},
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "meta_title": "Bản tin Crypto tháng 7/2025",
    "meta_description": "Phân tích thị trường crypto tháng 7/2025"
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Blog created successfully",
  "data": {
    "id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "is_published": false,
    "view_count": 0,
    "like_count": 0,
    "created_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

### 3.2. Sửa blog

**Endpoint:** `PUT /blogs/{id}`

**Request:**
```bash
curl -X PUT http://localhost:8080/blogs/1f16a072-ac6e-41d3-85c3-7168c6ec08c9 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bản tin thị trường Crypto tháng 7/2025 [CẬP NHẬT]",
    "content": "Thị trường crypto đang có những biến động mạnh với Bitcoin...",
    "is_published": true
  }'
```

### 3.3. Publish blog

**Endpoint:** `PUT /blogs/{id}/publish`

**Request:**
```bash
curl -X PUT http://localhost:8080/blogs/1f16a072-ac6e-41d3-85c3-7168c6ec08c9/publish \
  -H "Authorization: Bearer <access_token>"
```

### 3.4. Xóa blog

**Endpoint:** `DELETE /blogs/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/blogs/1f16a072-ac6e-41d3-85c3-7168c6ec08c9 \
  -H "Authorization: Bearer <access_token>"
```

---

## 4. Quản lý Danh mục (Category)

### 4.1. Tạo category

**Endpoint:** `POST /categories`

**Request:**
```bash
curl -X POST http://localhost:8080/categories \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Altcoin",
    "slug": "altcoin",
    "description": "Tin tức và phân tích về Altcoin"
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Category created successfully",
  "data": {
    "id": "35a892a4-0732-4dfb-84af-77fbbd898746",
    "name": "Altcoin",
    "slug": "altcoin",
    "description": "Tin tức và phân tích về Altcoin",
    "created_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

### 4.2. Sửa category

**Endpoint:** `PUT /categories/{id}`

**Request:**
```bash
curl -X PUT http://localhost:8080/categories/35a892a4-0732-4dfb-84af-77fbbd898746 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Altcoin & DeFi",
    "description": "Tin tức và phân tích về Altcoin và DeFi"
  }'
```

### 4.3. Xóa category

**Endpoint:** `DELETE /categories/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/categories/35a892a4-0732-4dfb-84af-77fbbd898746 \
  -H "Authorization: Bearer <access_token>"
```

---

## 5. Quản lý Tag

### 5.1. Tạo tag

**Endpoint:** `POST /tags`

**Request:**
```bash
curl -X POST http://localhost:8080/tags \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phân tích kỹ thuật",
    "slug": "phan-tich-ky-thuat"
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Tag created successfully",
  "data": {
    "id": "b2362d05-e3cc-4252-b506-645917b4c805",
    "name": "Phân tích kỹ thuật",
    "slug": "phan-tich-ky-thuat",
    "created_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

### 5.2. Sửa tag

**Endpoint:** `PUT /tags/{id}`

**Request:**
```bash
curl -X PUT http://localhost:8080/tags/b2362d05-e3cc-4252-b506-645917b4c805 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phân tích kỹ thuật nâng cao"
  }'
```

### 5.3. Xóa tag

**Endpoint:** `DELETE /tags/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/tags/b2362d05-e3cc-4252-b506-645917b4c805 \
  -H "Authorization: Bearer <access_token>"
```

---

## 6. Quản lý Bình luận (Comment)

### 6.1. Xem danh sách bình luận của blog

**Endpoint:** `GET /comments?source_type=blog&source_id=<blog_id>`

**Request:**
```bash
curl -X GET "http://localhost:8080/comments?source_type=blog&source_id=1f16a072-ac6e-41d3-85c3-7168c6ec08c9" \
  -H "Authorization: Bearer <access_token>"
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
      "user_id": "user-uuid",
      "source_type": "blog",
      "source_id": "1f16a072-ac6e-41d3-85c3-7168c6ec08c9",
      "created_at": "2025-07-05T10:00:00Z"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

### 6.2. Xóa bình luận

**Endpoint:** `DELETE /comments/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/comments/comment-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

## 7. Quản lý User

### 7.1. Lấy danh sách user

**Endpoint:** `GET /users?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:8080/users?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "ce88afd5-0cf0-4f16-b683-0de615f95946",
      "user_name": "System Administrator",
      "email": "admin@baotiendientu.com",
      "role": "admin",
      "created_at": "2025-07-05T10:00:00Z"
    },
    {
      "id": "9036d53e-a1b0-4203-b505-f75282e03ac8",
      "user_name": "Test Member",
      "email": "member@baotiendientu.com",
      "role": "member",
      "created_at": "2025-07-05T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "take": 10,
    "total": 2,
    "total_pages": 1
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

### 7.2. Xóa user

**Endpoint:** `DELETE /users/{id}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/users/user-uuid \
  -H "Authorization: Bearer <access_token>"
```

---

## 8. Health check hệ thống

**Endpoint:** `GET /health`

**Request:**
```bash
curl -X GET http://localhost:8080/health
```

**Response:**
```json
{
  "status_code": 200,
  "message": "OK",
  "data": {
    "status": "ok",
    "timestamp": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 9. Tham khảo tài liệu chi tiết

- **Swagger UI:** http://localhost:8080/docs
- **OpenAPI JSON:** http://localhost:8080/docs-json
- **Typescript types:** `@/client/types.ts`
- **Mock data:** `@/client/mock/`

---

## Lưu ý quan trọng

1. **Authentication:** Tất cả request cần quyền admin phải gửi header:
   ```
   Authorization: Bearer <access_token>
   ```

2. **Endpoint Rules:** Tất cả endpoint, field đều dùng snake_case

3. **Response Format:** Luôn trả về chuẩn như ví dụ trên

4. **Error Handling:** Kiểm tra status_code để xử lý lỗi

5. **Testing:** Dùng curl để test trước khi tích hợp vào frontend 