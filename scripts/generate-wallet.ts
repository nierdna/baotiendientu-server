import { ethers } from 'ethers';

/**
 * Script tạo ví Ethereum mới 
 * Dùng để tạo private key và address mới cho việc test
 */
function generateNewWallet() {
  // Tạo ví ngẫu nhiên
  const wallet = ethers.Wallet.createRandom();
  
  console.log('✨ Đã tạo ví mới:');
  console.log('🔑 Private Key:', wallet.privateKey);
  console.log('📬 Address:', wallet.address);
  console.log('🔐 Mnemonic:', wallet.mnemonic.phrase);
  
  console.log('\n⚠️ LƯU Ý: Đây chỉ là ví test, không dùng cho mục đích khác!');
  console.log('👉 Copy private key vào file test-auth-api.ts để test API');
}

// Chạy script
generateNewWallet(); 