import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from '@/database/entities/token.entity';
import { TokenRepository } from '@/database/repositories/token.repository';
import { BirdeyeService } from './birdeye.service';
import { chunk } from '@/shared/helper';
import { TokenInfo } from '@/shared/constants/token.interface';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class TokenService {
  @InjectRepository(TokenRepository)
  private readonly tokenRepository: TokenRepository;

  @Inject(forwardRef(() => BirdeyeService))
  private readonly birdeyeService: BirdeyeService;

  @InjectPinoLogger(TokenService.name)
  private readonly logger: PinoLogger;

  async getTokenByAddress(address: string): Promise<TokenInfo | null> {
    try {
      // Kiểm tra token trong database
      const existingToken = await this.tokenRepository.findByMintAddress(address);
      const ONE_MINUTE = 60 * 1000; // 1 phút tính bằng milliseconds
      
      // Nếu token tồn tại và mới update trong vòng 1 phút
      if (existingToken && 
          (Date.now() - existingToken.updated_at.getTime()) < ONE_MINUTE) {
        console.log('Token tồn tại trong database');
        return {
          name: existingToken.name,
          symbol: existingToken.symbol,
          address: existingToken.mint_address,
          decimals: existingToken.decimals,
          price: existingToken.data?.price || 0,
        };
      }

      // Nếu không có hoặc đã quá 1 phút thì get từ Birdeye
      const birdeyeToken = await this.birdeyeService.getTokenInfoByAddress(address);
      if (!birdeyeToken) {
        this.logger.warn(`Token không tồn tại: ${address}`);
        return null;
      }
      
      await this.tokenRepository.upsert({
        mint_address: birdeyeToken.address,
        name: birdeyeToken.name,
        symbol: birdeyeToken.symbol,
        decimals: birdeyeToken.decimals,
        icon: birdeyeToken.logoURI,
        data: birdeyeToken,
      }, {
        conflictPaths: ['mint_address'],
      }).catch((error) => {
        this.logger.error('Lỗi khi lưu token:', error);
      });

      return {
        name: birdeyeToken.name,
        symbol: birdeyeToken.symbol,
        address: birdeyeToken.address,
        decimals: birdeyeToken.decimals,
        price: birdeyeToken.price,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thông tin token ${address}:`, error);
      return null;
    }
  }

  async getTokensByAddresses(addresses: string[]): Promise<TokenInfo[]> {
    try {
      console.log(addresses);
      const chunks = chunk(addresses, 10); // Giảm chunk size xuống 10
      
      const results = await Promise.all(
        chunks.map(async (chunkAddresses) => {
          const tokens = await Promise.all(
            chunkAddresses.map(async (address) => {
              try {
                return await this.getTokenByAddress(address);
              } catch (error) {
                this.logger.warn(`Lỗi khi lấy token ${address}:`, error);
                return null;
              }
            })
          );
          return tokens.filter((token): token is TokenInfo => token !== null);
        })
      );

      return results.flat();
    } catch (error) {
      this.logger.error('Lỗi khi lấy danh sách token:', error);
      return [];
    }
  }
  async getTokensByWallet(walletAddress: string): Promise<TokenInfo[]> {
    try {
      const walletTokens = await this.birdeyeService.getWalletTokens(walletAddress);
      
      if (!walletTokens) {
        this.logger.warn(`Không tìm thấy token cho ví ${walletAddress}`);
        return [];
      }

      return walletTokens;

    } catch (error) {
      this.logger.error(`Lỗi khi lấy token cho ví ${walletAddress}:`, error);
      return [];
    }
  }
}
