# Blink Chat Backend - Test Scripts

Scripts để test các API của Blink Chat Backend.

## Cài đặt

```bash
cd scripts
npm install
```

## Sử dụng

### 1. Tạo ví Ethereum mới để test

```bash
npm run generate-wallet
```

Script này sẽ tạo một ví Ethereum mới, bao gồm:
- Private key
- Địa chỉ ví (address)
- Mnemonic phrase

Copy private key đã tạo vào file `test-auth-api.ts` để dùng cho bước tiếp theo.

### 2. Test API đăng nhập bằng Binance Wallet

```bash
npm run test-auth
```

Script này sẽ:
1. Tạo ví từ private key đã cấu hình
2. Gọi API `/auth/nonce` để lấy nonce
3. Ký thông điệp chứa nonce bằng private key
4. Gọi API `/auth/login` để đăng nhập
5. Hiển thị token JWT và thông tin người dùng nhận được

## Lưu ý

- Đảm bảo server đang chạy trước khi test
- Mặc định API URL là `http://localhost:3000`, nếu cần thay đổi, sửa trong file `test-auth-api.ts`
- Các ví tạo ra chỉ dùng cho mục đích test, không nên dùng cho các môi trường thật 