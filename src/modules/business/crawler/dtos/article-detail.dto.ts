import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CrawlArticleDetailRequestDto {
  @ApiProperty({
    description: 'Article ID to crawl detail content',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  articleId: string;

  @ApiPropertyOptional({
    description: 'Timeout for crawling in milliseconds',
    example: 30000,
    minimum: 5000,
    maximum: 120000,
    default: 45000
  })
  @IsOptional()
  @IsNumber()
  @Min(5000)
  @Max(120000)
  timeout?: number;
}

export class CrawlAllDetailsRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum number of articles to crawl in this batch',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Timeout for each article crawl in milliseconds',
    example: 30000,
    minimum: 5000,
    maximum: 120000,
    default: 45000
  })
  @IsOptional()
  @IsNumber()
  @Min(5000)
  @Max(120000)
  timeout?: number;
}

export class ArticleDetailDto {
  @ApiProperty({
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Article title',
    example: 'Bitcoin Price Analysis: Key Levels to Watch'
  })
  title: string;

  @ApiProperty({
    description: 'Article summary content',
    example: 'Bitcoin continues to show strong momentum...'
  })
  content: string;

  @ApiProperty({
    description: 'Detailed article content (crawled separately)',
    example: 'In this comprehensive analysis, we examine Bitcoin\'s recent price movements...',
    nullable: true
  })
  detailContent: string | null;

  @ApiProperty({
    description: 'Article featured image URL',
    example: 'https://coin68.com/images/bitcoin-analysis.jpg',
    nullable: true
  })
  image: string | null;

  @ApiProperty({
    description: 'Article URL path',
    example: '/bitcoin-price-analysis-key-levels/'
  })
  url: string;

  @ApiProperty({
    description: 'Article publication date',
    example: '15/06/2025'
  })
  date: string;

  @ApiProperty({
    description: 'Article category',
    example: 'Analysis',
    nullable: true
  })
  category: string | null;

  @ApiProperty({
    description: 'Whether detailed content has been crawled',
    example: true
  })
  isCrawledDetail: boolean;

  @ApiProperty({
    description: 'Timestamp when detailed content was crawled',
    example: '2023-06-15T10:30:00Z',
    nullable: true
  })
  crawledDetailAt: Date | null;

  @ApiProperty({
    description: 'Article creation timestamp',
    example: '2023-06-15T08:00:00Z'
  })
  createdAt: Date;
}

export class CrawlDetailStatsDto {
  @ApiProperty({
    description: 'Total number of articles in database',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Number of articles with detailed content crawled',
    example: 120
  })
  crawled: number;

  @ApiProperty({
    description: 'Number of articles without detailed content',
    example: 30
  })
  uncrawled: number;

  @ApiProperty({
    description: 'Percentage of articles crawled for details',
    example: 80
  })
  crawledPercentage: number;
}

export class CrawlDetailResultDto {
  @ApiProperty({
    description: 'Article ID that was crawled',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  articleId: string;

  @ApiProperty({
    description: 'Article title',
    example: 'Bitcoin Price Analysis: Key Levels to Watch'
  })
  title: string;

  @ApiProperty({
    description: 'Article URL that was crawled',
    example: '/bitcoin-price-analysis-key-levels/'
  })
  url: string;

  @ApiProperty({
    description: 'Length of extracted detailed content',
    example: 2500
  })
  contentLength: number;

  @ApiProperty({
    description: 'Time taken to crawl in milliseconds',
    example: 8500
  })
  crawlTime: number;

  @ApiProperty({
    description: 'Whether crawl was successful',
    example: true
  })
  success: boolean;
}

export class CrawlAllDetailsResultDto {
  @ApiProperty({
    description: 'Results for each article crawled',
    type: [CrawlDetailResultDto]
  })
  results: CrawlDetailResultDto[];

  @ApiProperty({
    description: 'Total number of articles processed',
    example: 10
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Number of successful crawls',
    example: 8
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failed crawls',
    example: 2
  })
  failureCount: number;

  @ApiProperty({
    description: 'Total processing time in milliseconds',
    example: 45000
  })
  totalTime: number;
} 