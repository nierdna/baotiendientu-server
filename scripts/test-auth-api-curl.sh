#!/bin/bash

# Script test API đăng nhập bằng Binance Wallet sử dụng curl
# Cách sử dụng: 
# 1. Cấp quyền thực thi: chmod +x test-auth-api-curl.sh
# 2. Chạy script: ./test-auth-api-curl.sh <địa_chỉ_ví>

# Kiểm tra tham số đầu vào
if [ -z "$1" ]; then
  echo "❌ Thiếu tham số: đường dẫn ví Ethereum"
  echo "Cách sử dụng: ./test-auth-api-curl.sh <địa_chỉ_ví>"
  exit 1
fi

# Cấu hình
API_URL="http://localhost:3000"
ADDRESS=$1

echo "🔍 Địa chỉ ví: $ADDRESS"

# Kiểm tra kết nối server
echo "🔄 Kiểm tra server..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health")
if [ "$HEALTH_RESPONSE" != "200" ]; then
  echo "❌ Server không khả dụng. Hãy đảm bảo server đang chạy."
  exit 1
fi
echo "✅ Server đang chạy."

# Gọi API lấy nonce
echo "🔄 Đang lấy nonce..."
NONCE_URL="${API_URL}/auth/nonce?address=${ADDRESS}"
echo "🔗 URL: $NONCE_URL"

NONCE_RESPONSE=$(curl -s "$NONCE_URL")
echo "📡 Phản hồi: $NONCE_RESPONSE"

NONCE=$(echo $NONCE_RESPONSE | grep -o '"nonce":[0-9]*' | cut -d':' -f2)

if [ -z "$NONCE" ]; then
  echo "❌ Không thể lấy nonce. Phản hồi từ API:"
  echo $NONCE_RESPONSE
  exit 1
fi

echo "✅ Lấy nonce thành công: $NONCE"

echo "⚠️ Bạn cần ký thông điệp sau bằng ví của mình:"
MESSAGE="Sign this message to login with nonce: $NONCE"
echo "📝 $MESSAGE"

# Yêu cầu chữ ký
echo "🔑 Nhập chữ ký của bạn:"
read SIGNATURE

if [ -z "$SIGNATURE" ]; then
  echo "❌ Chữ ký không được để trống"
  exit 1
fi

# Gọi API đăng nhập
echo "🔄 Đang đăng nhập..."
LOGIN_URL="${API_URL}/auth/login"
echo "🔗 URL: $LOGIN_URL"

LOGIN_PAYLOAD="{\"address\":\"${ADDRESS}\",\"signature\":\"${SIGNATURE}\"}"
echo "📦 Dữ liệu: $LOGIN_PAYLOAD"

LOGIN_RESPONSE=$(curl -s -X POST \
  "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD")

echo "📡 Phản hồi: $LOGIN_RESPONSE"

# Kiểm tra kết quả
if echo $LOGIN_RESPONSE | grep -q "access_token"; then
  echo "✅ Đăng nhập thành công!"
  echo "🔑 Phản hồi từ API:"
  echo $LOGIN_RESPONSE | jq . 2>/dev/null || echo $LOGIN_RESPONSE
else
  echo "❌ Đăng nhập thất bại. Phản hồi từ API:"
  echo $LOGIN_RESPONSE
fi 