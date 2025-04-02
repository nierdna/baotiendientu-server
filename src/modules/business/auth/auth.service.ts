import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../database/repositories/user.repository';
import { ethers } from 'ethers';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string): Promise<{ nonce: number }> {
    // Kiểm tra xem địa chỉ ví đã có trong hệ thống chưa
    let user = await this.userRepository.findByAddress(address);

    // Nếu chưa có, tạo người dùng mới
    if (!user) {
      user = new User();
      user.address = address;
      user.username = `user_${address.substring(0, 6)}`;
      user.email = `${address.substring(0, 6)}@placeholder.com`;
      user.nonce = Math.floor(Math.random() * 1000000);
      await this.userRepository.save(user);
    } else {
      // Cập nhật nonce mới
      user.nonce = Math.floor(Math.random() * 1000000);
      await this.userRepository.save(user);
    }

    return { nonce: user.nonce };
  }

  async verifySignature(address: string, signature: string) {
    // Tìm người dùng theo địa chỉ ví
    const user = await this.userRepository.findByAddress(address);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Tạo thông điệp để kiểm tra chữ ký
    const message = `Sign this message to login with nonce: ${user.nonce}`;

    try {
      // Khôi phục địa chỉ từ chữ ký
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);

      // Kiểm tra xem địa chỉ khôi phục có khớp với địa chỉ người dùng gửi lên không
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      // Cập nhật nonce mới
      user.nonce = Math.floor(Math.random() * 1000000);
      await this.userRepository.save(user);

      // Tạo JWT token
      const payload = { sub: user.id, address: user.address };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          address: user.address,
        },
      };
    } catch (error) {
      // Xử lý lỗi khi xác thực chữ ký
      throw new HttpException(
        'Signature verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}