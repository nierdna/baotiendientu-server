import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { CrawlerModule } from '../crawler/crawler.module';
import { DatabaseModule } from '../../database/database.module';
import { AiProcessingService } from '../services/ai-processing.service';
import { OpenAIService } from '../services/openai.service';

@Module({
  imports: [
    CrawlerModule,
    DatabaseModule,
  ],
  controllers: [ArticleController],
  providers: [AiProcessingService, OpenAIService],
  exports: [AiProcessingService],
})
export class ArticleModule {} 