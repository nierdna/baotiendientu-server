import { 
  Controller, 
  Get, 
  Post,
  Body,
  HttpStatus, 
  Query,
  BadRequestException,
  Res,
  Header 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { Response } from 'express';
import { CrawlerService } from '../crawler/crawler.service';
import { AiProcessingService } from '../services/ai-processing.service';
import { ProcessedArticleRepository } from '../../database/repositories/processed-article.repository';
import { 
  ProcessWithAiRequestDto, 
  ProcessWithAiResponseDto,
  ProcessedArticleDto
} from '../crawler/dtos/process-ai.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly aiProcessingService: AiProcessingService,
    private readonly processedArticleRepository: ProcessedArticleRepository,
  ) {}

  @Get('crawl-url')
  @ApiOperation({
    summary: 'Crawl full HTML from article URL',
    description: 'Crawls and returns the complete HTML content from the provided article URL'
  })
  @ApiQuery({
    name: 'url',
    description: 'Article URL to crawl',
    example: 'https://coin68.com/tin-tuc/bitcoin-tang-manh/',
    required: true
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article HTML crawled successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Article HTML crawled successfully',
        data: {
          url: 'https://coin68.com/tin-tuc/bitcoin-tang-manh/',
          htmlContent: '<!DOCTYPE html><html><head><title>Bitcoin tăng mạnh</title></head><body>Full HTML content here...</body></html>',
          htmlLength: 45820,
          crawlTime: 3500
        },
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid URL provided'
  })
  async crawlArticleUrl(@Query('url') url: string) {
    console.log(`🔍 [ArticleController] [crawlArticleUrl] [url]:`, url);

    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }

    const startTime = Date.now();

    try {
      // Crawl detailed content
      const htmlContent = await this.crawlerService.crawlArticleDetail(url);
      
      const crawlTime = Date.now() - startTime;
      
      console.log(`✅ [ArticleController] [crawlArticleUrl] [success]:`, {
        url,
        contentLength: htmlContent.length,
        crawlTime
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Article HTML crawled successfully',
        data: {
          url,
          htmlContent,
          htmlLength: htmlContent.length,
          crawlTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const crawlTime = Date.now() - startTime;
      
      console.log(`🔴 [ArticleController] [crawlArticleUrl] [error]:`, {
        url,
        error: error.message,
        crawlTime
      });

      throw new BadRequestException(`Failed to crawl article: ${error.message}`);
    }
  }

  @Get('download-html')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({
    summary: 'Download article HTML as file',
    description: 'Crawls the article URL and returns the HTML content as a downloadable file'
  })
  @ApiQuery({
    name: 'url',
    description: 'Article URL to crawl and download',
    example: 'https://coin68.com/tin-tuc/bitcoin-tang-manh/',
    required: true
  })
  @ApiQuery({
    name: 'filename',
    description: 'Custom filename for the downloaded file (optional)',
    example: 'bitcoin-article.html',
    required: false
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTML file downloaded successfully',
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: { type: 'string', example: 'text/html; charset=utf-8' }
      },
      'Content-Disposition': {
        description: 'File attachment header',
        schema: { type: 'string', example: 'attachment; filename="article.html"' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid URL provided'
  })
  async downloadArticleHtml(
    @Query('url') url: string,
    @Res({ passthrough: false }) res: Response,
    @Query('filename') customFilename?: string
  ) {
    console.log(`🔍 [ArticleController] [downloadArticleHtml] [url]:`, url);

    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }

    const startTime = Date.now();

    try {
      // Crawl HTML content (reuse the same logic)
      const htmlContent = await this.crawlerService.crawlArticleDetail(url);
      
      const crawlTime = Date.now() - startTime;
      
      // Generate filename
      const filename = this.generateHtmlFilename(url, htmlContent, customFilename);
      
      console.log(`✅ [ArticleController] [downloadArticleHtml] [success]:`, {
        url,
        htmlLength: htmlContent.length,
        filename,
        crawlTime
      });

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(htmlContent, 'utf8'));
      
      // Send HTML content as file
      res.send(htmlContent);

    } catch (error) {
      const crawlTime = Date.now() - startTime;
      
      console.log(`🔴 [ArticleController] [downloadArticleHtml] [error]:`, {
        url,
        error: error.message,
        crawlTime
      });

      throw new BadRequestException(`Failed to crawl and download article: ${error.message}`);
    }
  }

  @Post('process-with-ai')
  @ApiOperation({
    summary: 'Process article with AI',
    description: 'Crawls article HTML and processes it with AI to extract clean content, summary, and tags, then saves to database'
  })
  @ApiBody({
    type: ProcessWithAiRequestDto,
    description: 'Request body containing article URL and processing options'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article processed successfully',
    type: ProcessWithAiResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Article already processed'
  })
  async processWithAi(@Body() requestDto: ProcessWithAiRequestDto): Promise<ProcessWithAiResponseDto> {
    console.log(`🤖 [ArticleController] [processWithAi] [starting]:`, {
      url: requestDto.url,
      options: requestDto.options
    });

    const startTime = Date.now();

    try {
      // Check if article already processed
      const existingArticle = await this.processedArticleRepository.findByOriginalUrl(requestDto.url);
      if (existingArticle) {
        console.log(`⚠️ [ArticleController] [processWithAi] [already_exists]:`, {
          url: requestDto.url,
          existingId: existingArticle.id
        });

        // Return existing processed article
        const processedArticleDto: ProcessedArticleDto = {
          id: existingArticle.id,
          title: existingArticle.title,
          image: existingArticle.image,
          content: existingArticle.content,
          summary: existingArticle.summary,
          tags: existingArticle.tags,
          originalUrl: existingArticle.originalUrl,
          status: existingArticle.status,
          language: existingArticle.language,
          format: existingArticle.format,
          processingTime: existingArticle.processingTime,
          aiProvider: existingArticle.aiProvider,
          aiModel: existingArticle.aiModel,
          createdAt: existingArticle.createdAt
        };

        return {
          statusCode: HttpStatus.OK,
          message: 'Article already processed (returning existing result)',
          data: processedArticleDto,
          timestamp: new Date().toISOString()
        };
      }

      // Step 1: Crawl HTML content
      console.log(`🔍 [ArticleController] [processWithAi] [crawling_html]`);
      const htmlContent = await this.crawlerService.crawlArticleDetail(requestDto.url);
      
      const crawlTime = Date.now() - startTime;
      console.log(`✅ [ArticleController] [processWithAi] [html_crawled]:`, {
        contentLength: htmlContent.length,
        crawlTime
      });

      // Step 2: Process with AI
      console.log(`🤖 [ArticleController] [processWithAi] [processing_with_ai]`);
      const aiResult = await this.aiProcessingService.processHtmlContent(htmlContent, {
        extractOnly: requestDto.options?.extractOnly || false,
        language: requestDto.options?.language,
        format: requestDto.options?.format
      });

      const aiProcessingTime = Date.now() - startTime - crawlTime;
      console.log(`✅ [ArticleController] [processWithAi] [ai_processed]:`, {
        aiProcessingTime,
        titleLength: aiResult.title.length,
        contentLength: aiResult.content.length,
        tagsCount: aiResult.tags?.length || 0
      });

      // Step 3: Save to database
      console.log(`💾 [ArticleController] [processWithAi] [saving_to_db]`);
      const totalProcessingTime = Date.now() - startTime;
      
      const savedArticle = await this.processedArticleRepository.create({
        title: aiResult.title,
        image: aiResult.image,
        content: aiResult.content,
        summary: aiResult.summary,
        tags: aiResult.tags,
        originalUrl: requestDto.url,
        language: requestDto.options?.language || 'vi',
        format: requestDto.options?.format || 'markdown',
        processingTime: totalProcessingTime,
        aiProvider: 'openai',
        aiModel: 'gpt-4',
        metadata: {
          ...aiResult.metadata,
          crawlTime,
          aiProcessingTime,
          totalProcessingTime,
          extractOnly: requestDto.options?.extractOnly || false
        }
      });

      console.log(`✅ [ArticleController] [processWithAi] [success]:`, {
        id: savedArticle.id,
        url: requestDto.url,
        totalProcessingTime
      });

      // Convert to DTO
      const processedArticleDto: ProcessedArticleDto = {
        id: savedArticle.id,
        title: savedArticle.title,
        image: savedArticle.image,
        content: savedArticle.content,
        summary: savedArticle.summary,
        tags: savedArticle.tags,
        originalUrl: savedArticle.originalUrl,
        status: savedArticle.status,
        language: savedArticle.language,
        format: savedArticle.format,
        processingTime: savedArticle.processingTime,
        aiProvider: savedArticle.aiProvider,
        aiModel: savedArticle.aiModel,
        createdAt: savedArticle.createdAt
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'Article processed successfully',
        data: processedArticleDto,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const totalProcessingTime = Date.now() - startTime;
      
      console.log(`🔴 [ArticleController] [processWithAi] [error]:`, {
        url: requestDto.url,
        error: error.message,
        totalProcessingTime
      });

      throw new BadRequestException(`Failed to process article: ${error.message}`);
    }
  }

  /**
   * Generate filename for HTML download
   * @param url - Article URL
   * @param htmlContent - HTML content to extract title from
   * @param customFilename - Custom filename provided by user
   * @returns string - Generated filename
   */
  private generateHtmlFilename(url: string, htmlContent: string, customFilename?: string): string {
    console.log(`🔄 [ArticleController] [generateHtmlFilename] [generating_filename]`);

    // Use custom filename if provided
    if (customFilename) {
      // Ensure it has .html extension
      return customFilename.endsWith('.html') ? customFilename : `${customFilename}.html`;
    }

    try {
      // Try to extract title from HTML
      const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        let title = titleMatch[1].trim();
        
        // Clean title for filename
        title = title
          .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .substring(0, 100) // Limit length
          .toLowerCase();
        
        if (title) {
          console.log(`✅ [ArticleController] [generateHtmlFilename] [title_extracted]:`, title);
          return `${title}.html`;
        }
      }
    } catch (error) {
      console.log(`⚠️ [ArticleController] [generateHtmlFilename] [title_extraction_failed]:`, error.message);
    }

    // Fallback: generate from URL
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://coin68.com${url}`);
      let filename = urlObj.pathname
        .split('/')
        .filter(segment => segment.length > 0)
        .join('-')
        .replace(/[<>:"/\\|?*]/g, '')
        .substring(0, 50);
      
      if (!filename) {
        filename = 'article';
      }
      
      console.log(`✅ [ArticleController] [generateHtmlFilename] [url_based]:`, filename);
      return `${filename}.html`;
      
    } catch (error) {
      console.log(`⚠️ [ArticleController] [generateHtmlFilename] [url_parsing_failed]:`, error.message);
    }

    // Final fallback
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fallbackFilename = `article-${timestamp}.html`;
    
    console.log(`✅ [ArticleController] [generateHtmlFilename] [fallback]:`, fallbackFilename);
    return fallbackFilename;
  }
} 