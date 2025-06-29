import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OpenAIService } from './services/openai.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { ArticleModule } from './article/article.module';

const services = [OpenAIService];

@Module({
  imports: [DatabaseModule, ConfigModule, CrawlerModule, ArticleModule],
  exports: [...services, CrawlerModule, ArticleModule],
  providers: [...services],
})
export class BusinessModule {}
