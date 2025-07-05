# API Documentation for Client

## Base URL
- **Development:** `http://localhost:8080`
- **Production:** `https://api.baotiendientu.com` (khi deploy)

## Authentication
- Sử dụng **Bearer Token** cho các endpoint cần đăng nhập
- Đăng nhập qua `/users/login` để lấy token
- Gửi token qua header: `Authorization: Bearer <access_token>`

## Response Format
Tất cả API đều trả về chuẩn response:
```json
{
  "status_code": 200,
  "message": "Success",
  "data": { ... },
  "pagination": { ... },
  "timestamp": "2025-07-05T10:00:00Z"
}
```

## Endpoint Rules
- Tất cả endpoint dùng **snake_case**
- Không dùng get/post/put/delete trong path
- Ví dụ: `/blogs`, `/user-profile`, `/data-analysis`

## Error Handling
- **400:** Bad Request - Dữ liệu không hợp lệ
- **401:** Unauthorized - Chưa đăng nhập hoặc token hết hạn
- **403:** Forbidden - Không có quyền truy cập
- **404:** Not Found - Không tìm thấy resource
- **500:** Internal Server Error - Lỗi server

## Swagger UI
- **Development:** http://localhost:8080/docs
- **Production:** https://api.baotiendientu.com/docs

## Typescript Types
- Import types từ `@/client/types.ts`
- Types được sinh tự động từ Swagger

## Mock Data
- Dùng file trong `@/client/mock/` để phát triển frontend độc lập backend
- Mỗi file JSON tương ứng 1 endpoint

## 📁 Tài liệu API

- [**Admin API**](./admin-api.md) - Quản lý hệ thống (Admin)
- [**User API**](./user-api.md) - Nghiệp vụ người dùng (User)
- [**Media API**](./media-api.md) - Quản lý file upload (Admin)
- [**Blog with Tags API**](./blog-api-with-tags.md) - Tạo/sửa bài viết với tags (Admin)

## Quick Start
1. Đăng nhập để lấy token
2. Sử dụng token cho các request cần authentication
3. Tham khảo Swagger UI để xem chi tiết API
4. Dùng mock data khi backend chưa sẵn sàng

## Support
Liên hệ backend team khi cần hỗ trợ thêm. 