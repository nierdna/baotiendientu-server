import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrawlResponseDto {
  @ApiProperty({
    description: 'The URL that was crawled',
    example: 'https://coin68.com/article/'
  })
  url: string;

  @ApiProperty({
    description: 'The HTML content extracted from the URL',
    example: '<!DOCTYPE html><html><head><title>Tin Tức</title></head><body>...</body></html>'
  })
  html: string;

  @ApiPropertyOptional({
    description: 'The title of the webpage if available',
    example: 'Tin Tức - Coin68'
  })
  title?: string;

  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 200
  })
  statusCode: number;

  @ApiProperty({
    description: 'Content length in bytes',
    example: 25847
  })
  contentLength: number;

  @ApiProperty({
    description: 'Timestamp when the crawl was performed',
    example: '2023-06-15T10:30:00Z'
  })
  timestamp: Date;
} 