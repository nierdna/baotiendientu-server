import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OpenAIService } from './services/openai.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';

const services = [OpenAIService];

@Module({
  imports: [DatabaseModule, ConfigModule, CrawlerModule],
  exports: [...services, CrawlerModule],
  providers: [...services],
})
export class BusinessModule {}
