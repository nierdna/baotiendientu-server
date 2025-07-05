# Hướng dẫn sử dụng API cho Client

## Cấu trúc thư mục `@/client`

```
src/client/
├── README.md              # Tài liệu tổng quan
├── admin-api.md           # API cho Admin
├── user-api.md            # API cho User (Member)
├── API_GUIDE.md           # Hướng dẫn này
├── types.ts               # Typescript types (sẽ sinh tự động)
└── mock/                  # Mock data
    ├── login-success.json
    ├── blog-list.json
    ├── user-detail.json
    ├── category-list.json
    ├── comment-list.json
    ├── like-response.json
    ├── health-check.json
    ├── error-401.json
    ├── error-403.json
    ├── error-404.json
    └── error-400.json
```

## Cách sử dụng

### 1. Đọc tài liệu API
- **Admin:** Xem `admin-api.md` cho các chức năng quản trị
- **User:** Xem `user-api.md` cho các chức năng người dùng
- **Tổng quan:** Xem `README.md` cho thông tin chung

### 2. Test API với curl
Mỗi endpoint trong tài liệu đều có ví dụ curl để test:
```bash
# Ví dụ test login
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baotiendientu.com",
    "password": "Admin123!"
  }'
```

### 3. Sử dụng mock data
Khi backend chưa sẵn sàng, dùng mock data trong `mock/`:
```typescript
// Ví dụ sử dụng mock data
import loginResponse from '@/client/mock/login-success.json';
import blogList from '@/client/mock/blog-list.json';
```

### 4. Sinh Typescript types
```bash
# Cài tool
npm install -D openapi-typescript

# Sinh types từ swagger
npx openapi-typescript http://localhost:8080/docs-json -o src/client/types.ts
```

### 5. Tích hợp vào frontend
```typescript
// Ví dụ sử dụng types
import { BlogListResponse, LoginResponse } from '@/client/types';

// Ví dụ gọi API
const response: LoginResponse = await fetch('/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Quy tắc quan trọng

### 1. Authentication
- Lưu `access_token` sau khi login
- Gửi token qua header: `Authorization: Bearer <token>`
- Token có thời hạn, cần refresh khi hết hạn

### 2. Error Handling
- Luôn kiểm tra `status_code` trong response
- Xử lý các lỗi phổ biến: 400, 401, 403, 404, 500
- Hiển thị message lỗi từ server cho user

### 3. Pagination
- Sử dụng `page` và `limit` cho danh sách
- Response có `pagination` object với thông tin phân trang

### 4. Snake Case
- Tất cả endpoint, field đều dùng snake_case
- Ví dụ: `user_name`, `created_at`, `is_published`

## Ví dụ tích hợp

### React/Next.js
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.status_code === 200) {
      localStorage.setItem('token', data.data.access_token);
      return data.data;
    }
    throw new Error(data.message);
  };

  const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/users/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (data.status_code === 200) {
      return data.data;
    }
    throw new Error(data.message);
  };

  return { login, getProfile };
};
```

### Vue.js
```typescript
// composables/useApi.ts
export const useApi = () => {
  const apiCall = async (endpoint: string, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    const data = await response.json();
    if (data.status_code >= 400) {
      throw new Error(data.message);
    }
    return data;
  };

  return { apiCall };
};
```

## Troubleshooting

### 1. Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Token có thể hết hạn, cần login lại

### 2. Lỗi 403 Forbidden
- User không có quyền thực hiện action
- Kiểm tra role của user

### 3. Lỗi 400 Bad Request
- Dữ liệu gửi không đúng format
- Kiểm tra validation rules

### 4. Lỗi 404 Not Found
- Endpoint không tồn tại
- ID resource không đúng

## Liên hệ hỗ trợ
- **Swagger UI:** http://localhost:8080/docs
- **Backend Team:** Liên hệ khi cần hỗ trợ thêm 