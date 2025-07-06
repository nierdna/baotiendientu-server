# API Documentation for Blog with Tags

## Credentials
- **Email:** `admin@baotiendientu.com`
- **Password:** `Admin123!`

---

## 1. Tạo bài viết với Tags

**Endpoint:** `POST /blogs`

**Request:**
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
    "category": {"id": "category-uuid", "name": "Cryptocurrency", "slug": "cryptocurrency", "description": "Articles about cryptocurrency"},
    "tags": ["blockchain", "crypto", "bitcoin"]
  }'
```

**Lưu ý quan trọng:**
- **`slug` là tùy chọn** - Nếu không cung cấp, sẽ tự động tạo từ title
- **`slug` tự động tạo** - Chuyển title thành URL-friendly (ví dụ: "Bản tin Crypto" → "ban-tin-crypto")
- **`slug` tự động unique** - Nếu slug đã tồn tại, sẽ thêm số (ví dụ: "ban-tin-crypto-1")
- **`slug` tối đa 255 ký tự** - Đảm bảo slug không quá dài
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Blog created successfully",
  "data": {
    "id": "blog-uuid",
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
    "category": {"id": "category-uuid", "name": "Cryptocurrency", "slug": "cryptocurrency", "description": "Articles about cryptocurrency"},
    "author_id": "user-uuid",
    "is_published": false,
    "view_count": 0,
    "like_count": 0,
    "created_at": "2025-07-05T10:00:00Z",
    "updated_at": "2025-07-05T10:00:00Z",
    "tags": [
      {
        "id": "tag-1",
        "name": "blockchain",
        "slug": "blockchain"
      },
      {
        "id": "tag-2", 
        "name": "crypto",
        "slug": "crypto"
      },
      {
        "id": "tag-3",
        "name": "bitcoin",
        "slug": "bitcoin"
      }
    ]
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 2. Cập nhật bài viết với Tags

### 2.1. Update tổng quát (bao gồm is_published)

**Endpoint:** `PUT /blogs/:id`

**Request:**
```bash
curl -X PUT http://localhost:8080/blogs/blog-uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bản tin thị trường Crypto tháng 7/2025 - Cập nhật",
    "content": "Nội dung cập nhật...",
    "is_published": true,
    "tags": ["blockchain", "defi", "ethereum"]
  }'
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blog updated successfully",
  "data": {
    "id": "blog-uuid",
    "title": "Bản tin thị trường Crypto tháng 7/2025 - Cập nhật",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Nội dung cập nhật...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
    "category": {
      "id": "category-uuid",
      "name": "Cryptocurrency",
      "slug": "cryptocurrency",
      "description": "Articles about cryptocurrency"
    },
    "author": {
      "id": "user-uuid",
      "email": "author@example.com",
      "user_name": "Author Name",
      "avatar_url": "https://example.com/avatar.jpg",
      "role": "admin"
    },
    "is_published": true,
    "view_count": 0,
    "like_count": 0,
    "published_at": "2025-07-05T10:30:00Z",
    "created_at": "2025-07-05T10:00:00Z",
    "updated_at": "2025-07-05T10:30:00Z",
    "tags": [
      {
        "id": "tag-1",
        "name": "blockchain",
        "slug": "blockchain"
      },
      {
        "id": "tag-4",
        "name": "defi",
        "slug": "defi"
      },
      {
        "id": "tag-5",
        "name": "ethereum",
        "slug": "ethereum"
      }
    ]
  },
  "timestamp": "2025-07-05T10:30:00Z"
}
```

### 2.2. Publish trực tiếp

**Endpoint:** `PUT /blogs/:id/publish`

**Request:**
```bash
curl -X PUT http://localhost:8080/blogs/blog-uuid/publish \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blog published successfully",
  "data": {
    "id": "blog-uuid",
    "title": "Blog title",
    "slug": "blog-slug",
    "content": "Blog content",
    "is_published": true,
    "published_at": "2025-07-05T10:30:00Z",
    "updated_at": "2025-07-05T10:30:00Z"
  },
  "timestamp": "2025-07-05T10:30:00Z"
}
```

**Lưu ý:**
- **API 1** (`PUT /blogs/:id`) - Có thể update `is_published` cùng với các field khác
- **API 2** (`PUT /blogs/:id/publish`) - Chỉ publish blog, không cần body
- **Cả 2 API** đều yêu cầu authentication và quyền admin/author
- **`published_at`** sẽ được set tự động khi `is_published = true`

---

## 3. Lấy danh sách bài viết với Tags

**Endpoint:** `GET /blogs`

**Request:**
```bash
curl -X GET http://localhost:8080/blogs?page=1&limit=10
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blogs retrieved successfully",
  "data": [
    {
      "id": "blog-uuid",
      "title": "Bản tin thị trường Crypto tháng 7/2025",
      "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
      "content": "Thị trường crypto đang có những biến động mạnh...",
      "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
      "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
      "category": {
        "id": "category-uuid",
        "name": "Cryptocurrency",
        "slug": "cryptocurrency",
        "description": "Articles about cryptocurrency"
      },
      "author": {
        "id": "user-uuid",
        "email": "author@example.com",
        "user_name": "Author Name",
        "avatar_url": "https://example.com/avatar.jpg",
        "role": "admin"
      },
      "is_published": false,
      "view_count": 0,
      "like_count": 0,
      "created_at": "2025-07-05T10:00:00Z",
      "updated_at": "2025-07-05T10:00:00Z",
      "tags": [
        {
          "id": "tag-1",
          "name": "blockchain",
          "slug": "blockchain"
        },
        {
          "id": "tag-2",
          "name": "crypto",
          "slug": "crypto"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "take": 10,
    "total": 1,
    "total_pages": 1
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 4. Lấy chi tiết bài viết với Tags

**Endpoint:** `GET /blogs/:id`

**Request:**
```bash
curl -X GET http://localhost:8080/blogs/blog-uuid
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Blog retrieved successfully",
  "data": {
    "id": "blog-uuid",
    "title": "Bản tin thị trường Crypto tháng 7/2025",
    "slug": "ban-tin-thi-truong-crypto-thang-7-2025",
    "content": "Thị trường crypto đang có những biến động mạnh...",
    "excerpt": "Tổng quan thị trường crypto tháng 7/2025",
    "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
    "category": {"id": "category-uuid", "name": "Cryptocurrency", "slug": "cryptocurrency", "description": "Articles about cryptocurrency"},
    "author_id": "user-uuid",
    "is_published": false,
    "view_count": 1,
    "like_count": 0,
    "created_at": "2025-07-05T10:00:00Z",
    "updated_at": "2025-07-05T10:00:00Z",
    "tags": [
      {
        "id": "tag-1",
        "name": "blockchain",
        "slug": "blockchain"
      },
      {
        "id": "tag-2",
        "name": "crypto",
        "slug": "crypto"
      }
    ]
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 5. Lấy danh sách Tags

**Endpoint:** `GET /tags`

**Request:**
```bash
curl -X GET http://localhost:8080/tags
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": [
    {
      "id": "tag-1",
      "name": "blockchain",
      "slug": "blockchain",
      "created_at": "2025-07-05T10:00:00Z",
      "updated_at": "2025-07-05T10:00:00Z"
    },
    {
      "id": "tag-2",
      "name": "crypto",
      "slug": "crypto",
      "created_at": "2025-07-05T10:00:00Z",
      "updated_at": "2025-07-05T10:00:00Z"
    },
    {
      "id": "tag-3",
      "name": "bitcoin",
      "slug": "bitcoin",
      "created_at": "2025-07-05T10:00:00Z",
      "updated_at": "2025-07-05T10:00:00Z"
    }
  ],
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 6. Tạo Tag mới

**Endpoint:** `POST /tags`

**Request:**
```bash
curl -X POST http://localhost:8080/tags \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DeFi",
    "slug": "defi"
  }'
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Success",
  "data": {
    "id": "tag-4",
    "name": "DeFi",
    "slug": "defi",
    "created_at": "2025-07-05T10:00:00Z",
    "updated_at": "2025-07-05T10:00:00Z"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 7. Upload ảnh thumbnail

**Endpoint:** `POST /media/upload`

**Request:**
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/thumbnail.jpg"
```

**Response:**
```json
{
  "status_code": 200,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://i.ibb.co/abc123/image.jpg"
  },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

---

## 📝 Cách sử dụng Tags

### 1. **Tạo bài viết với tags có sẵn:**
```json
{
  "title": "Bài viết mới",
  "slug": "bai-viet-moi",
  "content": "Nội dung...",
  "tags": ["tag-1", "tag-2"]  // Sử dụng ID của tags có sẵn
}
```

### 2. **Tạo bài viết với tags mới:**
```json
{
  "title": "Bài viết mới",
  "slug": "bai-viet-moi", 
  "content": "Nội dung...",
  "tags": ["blockchain", "crypto"]  // Tự động tạo tags mới
}
```

### 3. **Kết hợp cả hai:**
```json
{
  "title": "Bài viết mới",
  "slug": "bai-viet-moi",
  "content": "Nội dung...",
  "tags": ["tag-1", "bitcoin", "defi"]  // ID + tên mới
}
```

---

## 🔄 Workflow hoàn chỉnh

### Bước 1: Upload thumbnail
```bash
curl -X POST http://localhost:8080/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./thumbnail.jpg"
```

### Bước 2: Lấy danh sách tags
```bash
curl -X GET http://localhost:8080/tags
```

### Bước 3: Tạo bài viết với thumbnail và tags
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "thumbnail_url": "https://i.ibb.co/abc123/image.jpg",
    "category": {"id": "category-uuid", "name": "Cryptocurrency", "slug": "cryptocurrency", "description": "Articles about cryptocurrency"},
    "tags": ["blockchain", "crypto", "bitcoin"]
  }'
```

---

## ⚡ Tính năng mới

✅ **Tags tự động tạo:** Nếu tag chưa tồn tại, hệ thống sẽ tự động tạo mới  
✅ **Hỗ trợ cả ID và tên:** Có thể dùng ID tag hoặc tên tag  
✅ **Response bao gồm tags:** Tất cả API blog đều trả về thông tin tags  
✅ **Upload ảnh tích hợp:** API upload ảnh sẵn sàng sử dụng  

---

## 📚 Tài liệu liên quan

- [Admin API](./admin-api.md) - Quản lý hệ thống
- [Media API](./media-api.md) - Upload file
- [Swagger UI](http://localhost:8080/docs) - Tài liệu API chi tiết 