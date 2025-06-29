import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { CrawlerService } from '../../business/crawler/crawler.service';
import { ArticleRepository } from '../../database/repositories/article.repository';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async onModuleInit() {
    this.logger.log('🔄 [ScheduleService] [onModuleInit] [scheduler_initialized]');
  }

  /**
   * Crawl articles from Coin68 every 10 minutes
   */
  @Cron('*/10 * * * *') // Every 10 minutes
  async crawlCoin68Articles() {
    const startTime = Date.now();
    this.logger.log('🔍 [ScheduleService] [crawlCoin68Articles] [starting_scheduled_crawl]');

    try {
      // Extract articles from Coin68
      const extractResult = await this.crawlerService.extractArticlesFromUrl({
        url: 'https://coin68.com/article/',
        usePuppeteer: true,
        waitForImages: true,
        scrollToBottom: true,
        maxScrolls: 5,
        waitTime: 3000,
        maxArticles: 30, // Get more articles to ensure we don't miss any
        timeout: 45000, // Longer timeout for scheduled job
      });

      this.logger.log('✅ [ScheduleService] [crawlCoin68Articles] [extraction_completed]', {
        totalExtracted: extractResult.totalArticles,
        processingTime: extractResult.processingTime,
        crawlMethod: extractResult.crawlMethod
      });

      // Filter out existing articles to avoid duplicates
      const newArticles = await this.articleRepository.filterNewArticles(extractResult.articles);
      
      this.logger.log('🔍 [ScheduleService] [crawlCoin68Articles] [duplicate_check_completed]', {
        totalExtracted: extractResult.totalArticles,
        newArticles: newArticles.length,
        duplicates: extractResult.totalArticles - newArticles.length
      });

      if (newArticles.length === 0) {
        this.logger.log('ℹ️ [ScheduleService] [crawlCoin68Articles] [no_new_articles]', 'All articles already exist in database');
        return;
      }

      // Save new articles to database
      const savedArticles = await this.articleRepository.saveArticles(newArticles);
      
      const processingTime = Date.now() - startTime;
      this.logger.log('✅ [ScheduleService] [crawlCoin68Articles] [crawl_completed]', {
        newArticlesSaved: savedArticles.length,
        totalProcessingTime: processingTime,
        sourceUrl: extractResult.sourceUrl
      });

      // Log some sample articles for verification
      if (savedArticles.length > 0) {
        const sampleArticles = savedArticles.slice(0, 3).map(article => ({
          title: article.title.substring(0, 50) + '...',
          url: article.url,
          image: article.image ? 'Has image' : 'No image'
        }));
        
        this.logger.log('📰 [ScheduleService] [crawlCoin68Articles] [sample_articles]', sampleArticles);
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('🔴 [ScheduleService] [crawlCoin68Articles] [error]', {
        error: error.message,
        processingTime,
        stack: error.stack
      });
    }
  }

  /**
   * Manual trigger for testing (can be called via API)
   */
  async triggerManualCrawl(): Promise<{ message: string, newArticles: number, totalTime: number }> {
    const startTime = Date.now();
    this.logger.log('🔄 [ScheduleService] [triggerManualCrawl] [manual_crawl_triggered]');

    try {
      const extractResult = await this.crawlerService.extractArticlesFromUrl({
        url: 'https://coin68.com/article/',
        usePuppeteer: true,
        waitForImages: true,
        scrollToBottom: true,
        maxScrolls: 3,
        waitTime: 2000,
        maxArticles: 20,
        timeout: 30000,
      });

      const newArticles = await this.articleRepository.filterNewArticles(extractResult.articles);
      
      if (newArticles.length > 0) {
        await this.articleRepository.saveArticles(newArticles);
      }

      const totalTime = Date.now() - startTime;
      
      this.logger.log('✅ [ScheduleService] [triggerManualCrawl] [manual_crawl_completed]', {
        newArticles: newArticles.length,
        totalTime
      });

      return {
        message: 'Manual crawl completed successfully',
        newArticles: newArticles.length,
        totalTime
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.logger.error('🔴 [ScheduleService] [triggerManualCrawl] [error]', {
        error: error.message,
        totalTime
      });
      throw error;
    }
  }

  /**
   * Get crawling statistics
   */
  async getCrawlStats(): Promise<{ totalArticles: number, latestArticles: any[] }> {
    const totalArticles = await this.articleRepository.getCount();
    const latestArticles = await this.articleRepository.findLatest(5);
    
    return {
      totalArticles,
      latestArticles: latestArticles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        date: article.date,
        createdAt: article.createdAt
      }))
    };
  }

  onApplicationBootstrap() {
    this.logger.log('🔄 [ScheduleService] [onApplicationBootstrap] [scheduler_initialized]');
    // this.crawlCoin68Articles().then(() => {
    //   this.logger.log('✅ [ScheduleService] [onApplicationBootstrap] [crawlCoin68Articles] [completed]');
    // });
  }
}
