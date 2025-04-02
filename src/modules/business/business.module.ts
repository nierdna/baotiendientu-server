import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ThreadService } from './services';
import { OpenAIService } from './services/openai.service';
import { ConfigModule } from '@nestjs/config';

const services = [ThreadService, OpenAIService];

@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule],
  exports: [AuthModule, ...services],
  providers: [...services],
})
export class BusinessModule {}
