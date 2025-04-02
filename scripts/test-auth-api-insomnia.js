// Script hỗ trợ test API đăng nhập với Binance Wallet trong Insomnia
// Để sử dụng:
// 1. Tạo Pre-request Script trong Insomnia
// 2. Paste code này vào
// 3. Tạo biến môi trường trong Insomnia: 
//    - private_key: private key của ví Ethereum
//    - address: địa chỉ ví Ethereum
//    - nonce: nonce từ API /auth/nonce

const ethers = require('ethers');

// Lấy giá trị từ environment
const privateKey = environment.private_key;
const address = environment.address;
const nonce = environment.nonce;

// Kiểm tra các giá trị bắt buộc
if (!privateKey) {
  console.error('❌ Thiếu private_key trong môi trường');
  return;
}

if (!nonce) {
  console.error('❌ Thiếu nonce - Hãy gọi API /auth/nonce trước');
  return;
}

try {
  // Tạo ví
  const wallet = new ethers.Wallet(privateKey);
  
  // Tạo thông điệp
  const message = `Sign this message to login with nonce: ${nonce}`;
  
  // Ký thông điệp
  const signature = await wallet.signMessage(message);
  
  // Gửi kết quả để được sử dụng trong request
  return {
    address: wallet.address,
    signature: signature
  };
} catch (error) {
  console.error('❌ Lỗi khi ký thông điệp:', error.message);
} 