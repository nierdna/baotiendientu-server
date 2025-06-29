import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUrl, IsOptional, IsNumber, IsString, IsObject, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CrawlRequestDto {
  @ApiProperty({
    description: 'URL to crawl and extract HTML content',
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
    example: 2000,
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
} 