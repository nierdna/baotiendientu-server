import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedArticleEntity } from '../entities/processed-article.entity';

export interface CreateProcessedArticleData {
  title: string;
  image?: string;
  content: string;
  summary?: string;
  tags?: string[];
  originalUrl: string;
  language?: string;
  format?: string;
  processingTime?: number;
  aiProvider?: string;
  aiModel?: string;
  metadata?: any;
}

@Injectable()
export class ProcessedArticleRepository {
  constructor(
    @InjectRepository(ProcessedArticleEntity)
    private readonly repository: Repository<ProcessedArticleEntity>,
  ) {}

  /**
   * Create a new processed article
   * @param data - Article data
   * @returns Promise<ProcessedArticleEntity>
   */
  async create(data: CreateProcessedArticleData): Promise<ProcessedArticleEntity> {
    const article = this.repository.create({
      ...data,
      status: 'processed',
      language: data.language || 'vi',
      format: data.format || 'markdown',
      aiProvider: data.aiProvider || 'openai',
      viewCount: 0
    });

    return await this.repository.save(article);
  }

  /**
   * Find processed article by original URL
   * @param originalUrl - Original article URL
   * @returns Promise<ProcessedArticleEntity | null>
   */
  async findByOriginalUrl(originalUrl: string): Promise<ProcessedArticleEntity | null> {
    return await this.repository.findOne({
      where: { originalUrl }
    });
  }

  /**
   * Find processed article by ID
   * @param id - Article ID
   * @returns Promise<ProcessedArticleEntity | null>
   */
  async findById(id: string): Promise<ProcessedArticleEntity | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  /**
   * Check if article already exists by URL
   * @param originalUrl - Original article URL
   * @returns Promise<boolean>
   */
  async existsByUrl(originalUrl: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { originalUrl }
    });
    return count > 0;
  }

  /**
   * Get all processed articles with pagination
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Promise<{ articles: ProcessedArticleEntity[], total: number }>
   */
  async findAllWithPagination(page: number = 1, limit: number = 20): Promise<{ articles: ProcessedArticleEntity[], total: number }> {
    const [articles, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { articles, total };
  }

  /**
   * Get latest processed articles
   * @param limit - Number of articles to get
   * @returns Promise<ProcessedArticleEntity[]>
   */
  async findLatest(limit: number = 10): Promise<ProcessedArticleEntity[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

     /**
    * Search processed articles by title or content
    * @param query - Search query
    * @param limit - Maximum results
    * @returns Promise<ProcessedArticleEntity[]>
    */
  async search(query: string, limit: number = 20): Promise<ProcessedArticleEntity[]> {
    return await this.repository
      .createQueryBuilder('article')
      .where('article.title LIKE :query OR article.content LIKE :query', {
        query: `%${query}%`
      })
      .orderBy('article.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get articles by tags
   * @param tags - Array of tags
   * @param limit - Maximum results
   * @returns Promise<ProcessedArticleEntity[]>
   */
  async findByTags(tags: string[], limit: number = 20): Promise<ProcessedArticleEntity[]> {
    return await this.repository
      .createQueryBuilder('article')
      .where('JSON_CONTAINS(article.tags, :tags)', {
        tags: JSON.stringify(tags)
      })
      .orderBy('article.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Update article view count
   * @param id - Article ID
   * @returns Promise<boolean>
   */
  async incrementViewCount(id: string): Promise<boolean> {
    const result = await this.repository.increment(
      { id },
      'viewCount',
      1
    );
    return result.affected > 0;
  }

  /**
   * Get processing statistics
   * @returns Promise<{ total: number, byProvider: any, byFormat: any }>
   */
  async getStats(): Promise<{ total: number, byProvider: any, byFormat: any }> {
    const total = await this.repository.count();
    
    const byProvider = await this.repository
      .createQueryBuilder('article')
      .select('article.aiProvider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('article.aiProvider')
      .getRawMany();

    const byFormat = await this.repository
      .createQueryBuilder('article')
      .select('article.format', 'format')
      .addSelect('COUNT(*)', 'count')
      .groupBy('article.format')
      .getRawMany();

    return { total, byProvider, byFormat };
  }

  /**
   * Delete processed article by ID
   * @param id - Article ID
   * @returns Promise<boolean>
   */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Update processed article
   * @param id - Article ID
   * @param updates - Fields to update
   * @returns Promise<boolean>
   */
  async update(id: string, updates: Partial<ProcessedArticleEntity>): Promise<boolean> {
    const result = await this.repository.update(id, updates);
    return result.affected > 0;
  }
} 