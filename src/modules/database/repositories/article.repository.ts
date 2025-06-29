import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleItemDto } from '../../business/crawler/dtos/extract-articles.dto';

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  /**
   * Find article by URL
   * @param url - Article URL
   * @returns Promise<ArticleEntity | null>
   */
  async findByUrl(url: string): Promise<ArticleEntity | null> {
    return await this.articleRepository.findOne({
      where: { url }
    });
  }

  /**
   * Find articles by URLs (batch check)
   * @param urls - Array of URLs
   * @returns Promise<ArticleEntity[]>
   */
  async findByUrls(urls: string[]): Promise<ArticleEntity[]> {
    if (urls.length === 0) return [];
    
    return await this.articleRepository.find({
      where: { url: In(urls) }
    });
  }

  /**
   * Check if article exists by URL
   * @param url - Article URL
   * @returns Promise<boolean>
   */
  async existsByUrl(url: string): Promise<boolean> {
    const count = await this.articleRepository.count({
      where: { url }
    });
    return count > 0;
  }

  /**
   * Save single article
   * @param articleData - Article data from crawler
   * @returns Promise<ArticleEntity>
   */
  async saveArticle(articleData: ArticleItemDto): Promise<ArticleEntity> {
    const article = this.articleRepository.create({
      title: articleData.title,
      content: articleData.content || '',
      image: articleData.image || '',
      url: articleData.url || '',
      date: articleData.date || '',
      category: articleData.category || '',
      source: 'coin68.com',
      status: 'published',
      viewCount: 0,
      metadata: {
        originalData: articleData,
        crawledAt: new Date().toISOString()
      }
    });

    return await this.articleRepository.save(article);
  }

  /**
   * Save multiple articles (batch save)
   * @param articlesData - Array of article data
   * @returns Promise<ArticleEntity[]>
   */
  async saveArticles(articlesData: ArticleItemDto[]): Promise<ArticleEntity[]> {
    if (articlesData.length === 0) return [];

    const articles = articlesData.map(articleData => 
      this.articleRepository.create({
        title: articleData.title,
        content: articleData.content || '',
        image: articleData.image || '',
        url: articleData.url || '',
        date: articleData.date || '',
        category: articleData.category || '',
        source: 'coin68.com',
        status: 'published',
        viewCount: 0,
        metadata: {
          originalData: articleData,
          crawledAt: new Date().toISOString()
        }
      })
    );

    return await this.articleRepository.save(articles);
  }

  /**
   * Filter out existing articles from new articles
   * @param newArticles - Array of new articles to check
   * @returns Promise<ArticleItemDto[]> - Articles that don't exist in database
   */
  async filterNewArticles(newArticles: ArticleItemDto[]): Promise<ArticleItemDto[]> {
    if (newArticles.length === 0) return [];

    // Get URLs from new articles (filter out empty URLs)
    const urls = newArticles
      .map(article => article.url)
      .filter(url => url && url.trim() !== '');

    if (urls.length === 0) return [];

    // Find existing articles
    const existingArticles = await this.findByUrls(urls);
    const existingUrls = new Set(existingArticles.map(article => article.url));

    // Filter out existing articles
    const filteredArticles = newArticles.filter(article => 
      article.url && !existingUrls.has(article.url)
    );

    return filteredArticles;
  }

  /**
   * Get all articles with pagination
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Promise<{ articles: ArticleEntity[], total: number }>
   */
  async findAllWithPagination(page: number = 1, limit: number = 20): Promise<{ articles: ArticleEntity[], total: number }> {
    const [articles, total] = await this.articleRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { articles, total };
  }

  /**
   * Get latest articles
   * @param limit - Number of articles to get
   * @returns Promise<ArticleEntity[]>
   */
  async findLatest(limit: number = 10): Promise<ArticleEntity[]> {
    return await this.articleRepository.find({
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Get articles count
   * @returns Promise<number>
   */
  async getCount(): Promise<number> {
    return await this.articleRepository.count();
  }

  /**
   * Delete article by ID
   * @param id - Article ID
   * @returns Promise<boolean>
   */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.articleRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Update article view count
   * @param id - Article ID
   * @returns Promise<boolean>
   */
  async incrementViewCount(id: string): Promise<boolean> {
    const result = await this.articleRepository.increment(
      { id },
      'viewCount',
      1
    );
    return result.affected > 0;
  }
} 