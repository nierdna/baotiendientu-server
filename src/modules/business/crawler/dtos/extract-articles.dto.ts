import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUrl, IsOptional, IsNumber, IsString, IsObject, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExtractArticlesRequestDto {
  @ApiProperty({
    description: 'URL to crawl and extract articles from',
    example: 'https://coin68.com/article/',
    type: String
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @ApiPropertyOptional({
    description: 'Request timeout in milliseconds',
    example: 30000,
    minimum: 5000,
    maximum: 120000,
    default: 30000
  })
  @IsOptional()
  @IsNumber()
  @Min(5000)
  @Max(120000)
  timeout?: number;

  @ApiPropertyOptional({
    description: 'Custom User-Agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Custom headers for the request',
    example: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' }
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Use Puppeteer for JavaScript-rendered pages (slower but more complete)',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  usePuppeteer?: boolean;

  @ApiPropertyOptional({
    description: 'CSS selector to wait for before capturing HTML',
    example: '.article-content, #main-content'
  })
  @IsOptional()
  @IsString()
  waitForSelector?: string;

  @ApiPropertyOptional({
    description: 'Additional wait time in milliseconds after page load',
    example: 3000,
    minimum: 0,
    maximum: 30000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30000)
  waitTime?: number;

  @ApiPropertyOptional({
    description: 'Wait for network to be idle (no requests for 500ms)',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  waitForNetworkIdle?: boolean;

  @ApiPropertyOptional({
    description: 'Wait for all images to load completely (ensures images are included in HTML)',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  waitForImages?: boolean;

  @ApiPropertyOptional({
    description: 'Scroll to bottom of page to trigger lazy loading images',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  scrollToBottom?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of scroll attempts to load lazy images',
    example: 5,
    minimum: 1,
    maximum: 20,
    default: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxScrolls?: number;

  @ApiPropertyOptional({
    description: 'CSS selector for article containers (auto-detect if not provided)',
    example: '.MuiBox-root.css-16jnb7i, .article-item'
  })
  @IsOptional()
  @IsString()
  articleSelector?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of articles to extract',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxArticles?: number;
}

export class ArticleItemDto {
  @ApiProperty({
    description: 'Article image URL',
    example: 'https://cdn.coin68.com/images/20250614121235_medium_255x175_19.webp'
  })
  image: string;

  @ApiProperty({
    description: 'Article title',
    example: 'Liệu BTC có hy vọng tăng lên vùng 125.000 USD vào cuối tháng 6?'
  })
  title: string;

  @ApiProperty({
    description: 'Article content/description',
    example: 'Một số dự báo cho rằng nếu Cục Dự trữ Liên bang Mỹ (Fed) hạ lãi suất, đó có thể là động lực giúp giá tiến lên vùng 120.000–125.000 USD vào cuối tháng 6.'
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Article URL/link',
    example: '/lieu-btc-co-hy-vong-tang-len-vung-125000-usd-vao-cuoi-thang-6/'
  })
  url?: string;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '14/06/2025'
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Article category/tag',
    example: 'Bitcoin'
  })
  category?: string;
}

export class ExtractArticlesResponseDto {
  @ApiProperty({
    description: 'Source URL that was crawled',
    example: 'https://coin68.com/article/'
  })
  sourceUrl: string;

  @ApiProperty({
    description: 'Array of extracted articles',
    type: [ArticleItemDto]
  })
  articles: ArticleItemDto[];

  @ApiProperty({
    description: 'Total number of articles found',
    example: 15
  })
  totalArticles: number;

  @ApiProperty({
    description: 'Page title',
    example: 'Tin Tức - Coin68'
  })
  pageTitle?: string;

  @ApiProperty({
    description: 'Crawl timestamp',
    example: '2023-06-15T10:30:00Z'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Crawl method used',
    example: 'puppeteer'
  })
  crawlMethod: string;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 15420
  })
  processingTime: number;
} 