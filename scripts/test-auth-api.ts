import axios, { AxiosError } from 'axios';
import { ethers } from 'ethers';

// Cấu hình
const API_URL = 'http://localhost:8000';
const PRIVATE_KEY = '0x11f55b8b0615deb08729bfe57d3139573e183eb0bd41a958bca2b9bb33b8ba86'; // Thay thế bằng private key đã tạo từ script generate-wallet

// Kiểm tra kết nối server trước khi thực hiện các thao tác chính
async function checkServerConnection(): Promise<boolean> {
  try {
    console.log(`🔍 Kiểm tra kết nối đến server ${API_URL}...`);
    await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Kết nối thành công đến server!');
    return true;
  } catch (error) {
    console.error('❌ Không thể kết nối đến server. Hãy đảm bảo server đang chạy.');
    if (axios.isAxiosError(error)) {
      console.error(`🔴 Chi tiết lỗi: ${error.code || 'unknown'}`);
    }
    return false;
  }
}

async function main() {
  try {
    // Kiểm tra kết nối server
    const isServerConnected = await checkServerConnection();
    if (!isServerConnected) {
      console.error('❌ Hãy đảm bảo server đang chạy trước khi test API.');
      process.exit(1);
    }

    // Tạo ví từ private key
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const address = wallet.address;

    console.log('🔍 Địa chỉ ví:', address);

    // Gọi API lấy nonce
    const nonceUrl = `${API_URL}/auth/nonce?address=${address}`;
    console.log(`🔄 Đang lấy nonce từ: ${nonceUrl}`);
    
    const nonceResponse = await axios.get(nonceUrl);
    
    console.log('📡 Nhận phản hồi:', JSON.stringify(nonceResponse.data));
    
    if (!nonceResponse.data.hasOwnProperty('nonce')) {
      throw new Error('Phản hồi từ API không chứa trường nonce');
    }
    
    const nonce = nonceResponse.data.nonce;
    console.log('✅ Lấy nonce thành công:', nonce);

    // Tạo thông điệp để ký
    const message = `Sign this message to login with nonce: ${nonce}`;
    console.log('📝 Thông điệp cần ký:', message);

    // Ký thông điệp
    console.log('🔑 Đang ký thông điệp...');
    const signature = await wallet.signMessage(message);
    console.log('✅ Ký thông điệp thành công:', signature);

    // Gọi API đăng nhập
    const loginUrl = `${API_URL}/auth/login`;
    console.log(`🔄 Đang đăng nhập vào: ${loginUrl}`);
    
    const loginData = { address, signature };
    console.log('📦 Dữ liệu gửi đi:', JSON.stringify(loginData));
    
    const loginResponse = await axios.post(loginUrl, loginData);

    // Hiển thị kết quả
    console.log('✅ Đăng nhập thành công!');
    console.log('🔑 Access token:', loginResponse.data.access_token);
    console.log('👤 Thông tin người dùng:', JSON.stringify(loginResponse.data.user, null, 2));

    return loginResponse.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('🔴 Lỗi API:', error.message);
      console.error('🔗 URL:', error.config?.url);
      console.error('📋 Status:', error.response?.status);
      console.error('📄 Response:', JSON.stringify(error.response?.data || {}, null, 2));
    } else if (error instanceof Error) {
      console.error('🔴 Lỗi:', error.message);
    } else {
      console.error('🔴 Lỗi không xác định:', error);
    }
    throw error;
  }
}

// Chạy script
main()
  .then((result) => {
    console.log('✨ Script hoàn thành thành công!');
  })
  .catch((error) => {
    console.error('💥 Script thất bại!');
    process.exit(1);
  });