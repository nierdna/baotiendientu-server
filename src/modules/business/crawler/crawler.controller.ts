import { Controller, Post, Body, HttpStatus, Get, Query, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { CrawlerService } from './crawler.service';
import { CrawlRequestDto } from './dtos/crawl-request.dto';
import { CrawlResponseDto } from './dtos/crawl-response.dto';
import { DownloadHtmlQueryDto } from './dtos/download-html-query.dto';
import { ExtractArticlesRequestDto, ExtractArticlesResponseDto } from './dtos/extract-articles.dto';

@ApiTags('Crawler')
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('crawl-html')
  @ApiOperation({
    summary: 'Crawl HTML content from URL',
    description: 'Fetches and returns the HTML content from a specified URL along with metadata such as title, status code, and content length'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTML content successfully crawled',
    type: CrawlResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'HTML content crawled successfully',
        data: {
          url: 'https://coin68.com/article/',
          html: '<!DOCTYPE html><html><head><title>Tin Tức</title></head><body>...</body></html>',
          title: 'Tin Tức - Coin68',
          statusCode: 200,
          contentLength: 25847,
          timestamp: '2023-06-15T10:30:00Z'
        },
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid URL or request parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'Domain not found: https://invalid-domain.com',
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during crawling',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to crawl URL: Network error',
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  async crawlHtml(@Body() crawlRequest: CrawlRequestDto) {
    console.log(`🔍 [CrawlerController] [crawlHtml] [request]:`, crawlRequest);
    
    const result = await this.crawlerService.crawlUrl(crawlRequest);
    
    console.log(`✅ [CrawlerController] [crawlHtml] [success]:`, {
      url: result.url,
      statusCode: result.statusCode,
      contentLength: result.contentLength
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'HTML content crawled successfully',
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  @Get('download-html')
  @ApiOperation({
    summary: 'Download HTML file from URL',
    description: 'Crawls a URL and returns the HTML content as a downloadable file or for direct viewing in browser'
  })
  @ApiQuery({
    name: 'url',
    description: 'URL to crawl and download HTML content',
    example: 'https://coin68.com/article/',
    required: true
  })
  @ApiQuery({
    name: 'timeout',
    description: 'Request timeout in milliseconds',
    example: 10000,
    required: false
  })
  @ApiQuery({
    name: 'userAgent',
    description: 'Custom User-Agent string',
    required: false
  })
  @ApiQuery({
    name: 'download',
    description: 'Force download the file (true) or display in browser (false)',
    example: false,
    required: false,
    type: Boolean
  })
  @ApiQuery({
    name: 'filename',
    description: 'Custom filename for the downloaded file (without extension)',
    example: 'coin68-article',
    required: false
  })
  @ApiQuery({
    name: 'usePuppeteer',
    description: 'Use Puppeteer for JavaScript-rendered pages (slower but more complete)',
    example: true,
    required: false,
    type: Boolean
  })
  @ApiQuery({
    name: 'waitForSelector',
    description: 'CSS selector to wait for before capturing HTML',
    example: '.article-content',
    required: false
  })
  @ApiQuery({
    name: 'waitTime',
    description: 'Additional wait time in milliseconds after page load',
    example: 2000,
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'waitForNetworkIdle',
    description: 'Wait for network to be idle (no requests for 500ms)',
    example: true,
    required: false,
    type: Boolean
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTML file successfully downloaded or displayed',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<!DOCTYPE html><html><head><title>Tin Tức</title></head><body>...</body></html>'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid URL or request parameters'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during crawling'
  })
  async downloadHtml(
    @Query() downloadQuery: DownloadHtmlQueryDto,
    @Res() res: Response
  ) {
    console.log(`🔍 [CrawlerController] [downloadHtml] [query]:`, downloadQuery);
    
    const result = await this.crawlerService.crawlHtmlForDownload(downloadQuery);
    
    console.log(`✅ [CrawlerController] [downloadHtml] [success]:`, {
      url: downloadQuery.url,
      filename: result.filename,
      contentLength: result.html.length
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    if (downloadQuery.download) {
      // Force download
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    } else {
      // Display in browser
      res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
    }
    
    res.setHeader('Content-Length', Buffer.byteLength(result.html, 'utf8'));
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send HTML content
    res.send(result.html);
  }

  @Post('extract-articles')
  @ApiOperation({
    summary: 'Extract articles from URL',
    description: 'Crawls a URL with full image loading and extracts structured article data including images, titles, and content'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Articles successfully extracted from URL',
    type: ExtractArticlesResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Articles extracted successfully',
        data: {
          sourceUrl: 'https://coin68.com/article/',
          articles: [
            {
              image: 'https://cdn.coin68.com/images/20250614121235_medium_255x175_19.webp',
              title: 'Liệu BTC có hy vọng tăng lên vùng 125.000 USD vào cuối tháng 6?',
              content: 'Một số dự báo cho rằng nếu Cục Dự trữ Liên bang Mỹ (Fed) hạ lãi suất, đó có thể là động lực giúp giá tiến lên vùng 120.000–125.000 USD vào cuối tháng 6.',
              url: '/lieu-btc-co-hy-vong-tang-len-vung-125000-usd-vao-cuoi-thang-6/',
              date: '14/06/2025',
              category: 'Bitcoin'
            }
          ],
          totalArticles: 15,
          pageTitle: 'Tin Tức - Coin68',
          timestamp: '2023-06-15T10:30:00Z',
          crawlMethod: 'puppeteer',
          processingTime: 15420
        },
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid URL or request parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'Domain not found: https://invalid-domain.com',
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during article extraction',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to extract articles: Parsing error',
        timestamp: '2023-06-15T10:30:00Z'
      }
    }
  })
  async extractArticles(@Body() extractRequest: ExtractArticlesRequestDto) {
    console.log(`🔍 [CrawlerController] [extractArticles] [request]:`, extractRequest);
    
    const result = await this.crawlerService.extractArticlesFromUrl(extractRequest);
    
    console.log(`✅ [CrawlerController] [extractArticles] [success]:`, {
      url: result.sourceUrl,
      totalArticles: result.totalArticles,
      processingTime: result.processingTime,
      crawlMethod: result.crawlMethod
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Articles extracted successfully',
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 