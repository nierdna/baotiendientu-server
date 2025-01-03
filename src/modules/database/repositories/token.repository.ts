import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TokenEntity } from '../entities/token.entity';

@Injectable()
export class TokenRepository extends Repository<TokenEntity> {
  constructor(private dataSource: DataSource) {
    super(TokenEntity, dataSource.createEntityManager());
  }

  async findByMintAddress(mintAddress: string): Promise<TokenEntity | null> {
    return this.findOne({
      where: {
        mint_address: mintAddress,
      },
    });
  }

} 