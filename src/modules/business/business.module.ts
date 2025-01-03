import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { TokenService } from './services/token.service';
import { TokenRepository } from '@/database/repositories/token.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from '@/database/entities/token.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([TokenEntity])
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class BusinessModule {}
