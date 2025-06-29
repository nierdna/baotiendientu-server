import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUrl, IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class DownloadHtmlQueryDto {
  @ApiProperty({
    description: 'URL to crawl and download HTML content',
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
  @Transform(({ value }) => parseInt(value))
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
    description: 'Whether to force download the file (Content-Disposition: attachment)',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  download?: boolean;

  @ApiPropertyOptional({
    description: 'Custom filename for the downloaded file (without extension)',
    example: 'coin68-article'
  })
  @IsOptional()
  @IsString()
  filename?: string;

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
  @Transform(({ value }) => parseInt(value))
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