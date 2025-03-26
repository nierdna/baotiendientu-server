import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule],
  providers: [],
  exports: [],
})
export class BusinessModule {}
