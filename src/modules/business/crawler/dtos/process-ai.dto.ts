import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum ProcessFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  TEXT = 'text'
}

export enum ProcessLanguage {
  VI = 'vi',
  EN = 'en'
}

export class ProcessOptionsDto {
  @ApiPropertyOptional({
    description: 'Whether to only extract content without AI processing',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  extractOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Language for AI processing',
    enum: ProcessLanguage,
    example: ProcessLanguage.VI,
    default: ProcessLanguage.VI
  })
  @IsOptional()
  @IsEnum(ProcessLanguage)
  language?: ProcessLanguage;

  @ApiPropertyOptional({
    description: 'Output format for processed content',
    enum: ProcessFormat,
    example: ProcessFormat.MARKDOWN,
    default: ProcessFormat.MARKDOWN
  })
  @IsOptional()
  @IsEnum(ProcessFormat)
  format?: ProcessFormat;
}

export class ProcessWithAiRequestDto {
  @ApiProperty({
    description: 'Article URL to process',
    example: 'https://coin68.com/tin-tuc/bitcoin-tang-manh/'
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Processing options',
    type: ProcessOptionsDto
  })
  @IsOptional()
  options?: ProcessOptionsDto;
}

export class ProcessedArticleDto {
  @ApiProperty({
    description: 'Processed article ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Article title (extracted and cleaned by AI)',
    example: 'Bitcoin tăng mạnh: Phân tích xu hướng thị trường'
  })
  title: string;

  @ApiProperty({
    description: 'Content processed by AI',
    example: '# Bitcoin tăng mạnh\n\nBitcoin đã có một tuần tăng trưởng mạnh mẽ...'
  })
  content: string;

  @ApiProperty({
    description: 'AI-generated summary',
    example: 'Bitcoin đã tăng 15% trong tuần qua do nhiều yếu tố tích cực...',
    nullable: true
  })
  summary: string | null;

  @ApiProperty({
    description: 'AI-extracted tags',
    example: ['bitcoin', 'cryptocurrency', 'market-analysis'],
    type: [String],
    nullable: true
  })
  tags: string[] | null;

  @ApiProperty({
    description: 'Original article URL',
    example: 'https://coin68.com/tin-tuc/bitcoin-tang-manh/'
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Processing status',
    example: 'processed'
  })
  status: string;

  @ApiProperty({
    description: 'Content language',
    example: 'vi'
  })
  language: string;

  @ApiProperty({
    description: 'Content format',
    example: 'markdown'
  })
  format: string;

  @ApiProperty({
    description: 'Time taken to process (milliseconds)',
    example: 5000,
    nullable: true
  })
  processingTime: number | null;

  @ApiProperty({
    description: 'AI provider used',
    example: 'openai'
  })
  aiProvider: string;

  @ApiProperty({
    description: 'AI model used',
    example: 'gpt-4',
    nullable: true
  })
  aiModel: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-06-15T10:30:00Z'
  })
  createdAt: Date;
}

export class ProcessWithAiResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Article processed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Processed article data',
    type: ProcessedArticleDto
  })
  data: ProcessedArticleDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2023-06-15T10:30:00Z'
  })
  timestamp: string;
}

export class AiProcessingResultDto {
  @ApiProperty({
    description: 'Extracted/processed title',
    example: 'Bitcoin tăng mạnh: Phân tích xu hướng thị trường'
  })
  title: string;

  @ApiProperty({
    description: 'Clean content',
    example: '# Bitcoin tăng mạnh\n\nNội dung đã được AI xử lý và làm sạch...'
  })
  content: string;

  @ApiProperty({
    description: 'AI-generated summary',
    example: 'Bitcoin đã có tuần tăng trưởng mạnh mẽ...',
    nullable: true
  })
  summary: string | null;

  @ApiProperty({
    description: 'Extracted tags',
    example: ['bitcoin', 'cryptocurrency', 'analysis'],
    type: [String],
    nullable: true
  })
  tags: string[] | null;

  @ApiProperty({
    description: 'Processing metadata',
    example: {
      wordCount: 1500,
      readingTime: 6,
      confidence: 0.95
    },
    nullable: true
  })
  metadata: any;
} 