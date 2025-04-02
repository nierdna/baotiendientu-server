import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ThreadService } from './services';

const services = [ThreadService];

@Module({
  imports: [DatabaseModule, AuthModule],
  exports: [AuthModule, ...services],
  providers: [...services],
})
export class BusinessModule {}
