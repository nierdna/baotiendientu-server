import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { CrawlResult, CrawlOptions } from './interfaces/crawler.interface';
import { CrawlRequestDto } from './dtos/crawl-request.dto';
import { DownloadHtmlQueryDto } from './dtos/download-html-query.dto';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly defaultTimeout = 30000; // Increase default timeout to 30s
  private readonly defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  /**
   * Crawl HTML content from a given URL
   * @param crawlRequest - The crawl request parameters
   * @returns Promise<CrawlResult> - The crawled HTML content and metadata
   */
  async crawlUrl(crawlRequest: CrawlRequestDto): Promise<CrawlResult> {
    const { url, timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle } = crawlRequest;
    
    console.log(`🔍 [CrawlerService] [crawlUrl] [url]:`, url);
    console.log(`🔍 [CrawlerService] [crawlUrl] [options]:`, { 
      timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle 
    });

    try {
      const options: CrawlOptions = {
        timeout: timeout || this.defaultTimeout,
        userAgent: userAgent || this.defaultUserAgent,
        headers: headers || {},
        usePuppeteer: usePuppeteer !== false, // Default to true
        waitForSelector,
        waitTime,
        waitForNetworkIdle: waitForNetworkIdle !== false // Default to true
      };

      // Use Puppeteer by default for better JavaScript support
      if (options.usePuppeteer) {
        try {
          const crawlResult = await this.fetchHtmlWithPuppeteer(url, options);
          
          console.log(`✅ [CrawlerService] [crawlUrl] [puppeteer_success]:`, {
            url: crawlResult.url,
            statusCode: crawlResult.statusCode,
            contentLength: crawlResult.contentLength,
            title: crawlResult.title
          });

          return crawlResult;
        } catch (puppeteerError) {
          console.log(`⚠️ [CrawlerService] [crawlUrl] [puppeteer_failed_fallback_to_axios]:`, puppeteerError.message);
          
          // Fallback to axios if Puppeteer fails
          const response = await this.fetchHtml(url, options);
          const crawlResult = this.processHtmlResponse(url, response);
          
          console.log(`✅ [CrawlerService] [crawlUrl] [axios_fallback_success]:`, {
            url: crawlResult.url,
            statusCode: crawlResult.statusCode,
            contentLength: crawlResult.contentLength,
            title: crawlResult.title
          });

          return crawlResult;
        }
      } else {
        // Fallback to axios
        const response = await this.fetchHtml(url, options);
        const crawlResult = this.processHtmlResponse(url, response);
        
        console.log(`✅ [CrawlerService] [crawlUrl] [axios_success]:`, {
          url: crawlResult.url,
          statusCode: crawlResult.statusCode,
          contentLength: crawlResult.contentLength,
          title: crawlResult.title
        });

        return crawlResult;
      }
    } catch (error) {
      console.log(`🔴 [CrawlerService] [crawlUrl] [error]:`, error.message);
      this.handleCrawlError(error, url);
    }
  }

  /**
   * Fetch HTML content from URL using Puppeteer
   * @param url - The URL to fetch
   * @param options - Crawl options
   * @returns Promise<CrawlResult> - The crawl result
   */
  private async fetchHtmlWithPuppeteer(url: string, options: CrawlOptions): Promise<CrawlResult> {
    console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [starting]:`, url);

    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images', // Disable images for faster loading
          '--disable-javascript', // We'll enable it selectively
        ],
        timeout: 60000, // Browser launch timeout
        protocolTimeout: 60000
      });

      page = await browser.newPage();

      // Set page timeouts
      page.setDefaultTimeout(options.timeout || this.defaultTimeout);
      page.setDefaultNavigationTimeout(options.timeout || this.defaultTimeout);

      // Set user agent
      if (options.userAgent) {
        await page.setUserAgent(options.userAgent);
      }

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Set extra headers with Vietnamese locale
      const defaultHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      };
      
      await page.setExtraHTTPHeaders(defaultHeaders);

      // Enable JavaScript for this specific site
      await page.setJavaScriptEnabled(true);

      // Navigate to page with timeout and retry mechanism
      console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [navigating]:`, url);
      
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await page.goto(url, {
            waitUntil: options.waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded', // Use networkidle2 instead of networkidle0
            timeout: options.timeout || this.defaultTimeout
          });
          
          if (response) {
            break; // Success, exit retry loop
          }
        } catch (error) {
          retryCount++;
          console.log(`⚠️ [CrawlerService] [fetchHtmlWithPuppeteer] [retry_${retryCount}]:`, error.message);
          
          if (retryCount >= maxRetries) {
            throw error; // Re-throw after max retries
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!response) {
        throw new Error('Failed to get response from page after retries');
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [waiting_for_selector]:`, options.waitForSelector);
        try {
          await page.waitForSelector(options.waitForSelector, { 
            timeout: 10000 
          });
        } catch (error) {
          console.log(`⚠️ [CrawlerService] [fetchHtmlWithPuppeteer] [selector_timeout]:`, options.waitForSelector);
          // Continue anyway, selector might not be critical
        }
      }

      // Additional wait time if specified
      if (options.waitTime && options.waitTime > 0) {
        console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [additional_wait]:`, options.waitTime);
        await new Promise(resolve => setTimeout(resolve, options.waitTime));
      }

      // Get the HTML content
      const html = await page.content();
      const statusCode = response.status();
      
      console.log(`✅ [CrawlerService] [fetchHtmlWithPuppeteer] [response]:`, {
        status: statusCode,
        contentLength: html.length
      });

      // Extract title using cheerio
      let title: string | undefined;
      try {
        const $ = cheerio.load(html);
        title = $('title').text().trim() || undefined;
      } catch (error) {
        console.log(`⚠️ [CrawlerService] [fetchHtmlWithPuppeteer] [title_extraction_error]:`, error.message);
      }

      return {
        url,
        html,
        title,
        statusCode,
        contentLength: html.length,
        timestamp: new Date()
      };

    } catch (error) {
      console.log(`🔴 [CrawlerService] [fetchHtmlWithPuppeteer] [error]:`, error.message);
      throw error;
    } finally {
      // Clean up
      if (page) {
        await page.close();
      }
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Fetch HTML content from URL using axios
   * @param url - The URL to fetch
   * @param options - Crawl options
   * @returns Promise<AxiosResponse> - The HTTP response
   */
  private async fetchHtml(url: string, options: CrawlOptions): Promise<AxiosResponse> {
    console.log(`🔄 [CrawlerService] [fetchHtml] [starting]:`, url);

    const axiosConfig = {
      timeout: options.timeout,
      headers: {
        'User-Agent': options.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      validateStatus: (status: number) => status < 500, // Accept all status codes < 500
    };

    const response = await axios.get(url, axiosConfig);
    
    console.log(`✅ [CrawlerService] [fetchHtml] [response]:`, {
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length']
    });

    return response;
  }

  /**
   * Process the HTML response and extract metadata
   * @param url - The original URL
   * @param response - The HTTP response
   * @returns CrawlResult - Processed crawl result
   */
  private processHtmlResponse(url: string, response: AxiosResponse): CrawlResult {
    const html = response.data;
    const contentLength = html.length;
    
    // Extract title using cheerio
    let title: string | undefined;
    try {
      const $ = cheerio.load(html);
      title = $('title').text().trim() || undefined;
    } catch (error) {
      console.log(`⚠️ [CrawlerService] [processHtmlResponse] [title_extraction_error]:`, error.message);
    }

    return {
      url,
      html,
      title,
      statusCode: response.status,
      contentLength,
      timestamp: new Date()
    };
  }

  /**
   * Crawl HTML for download/direct view
   * @param downloadQuery - The download query parameters
   * @returns Promise<{ html: string, filename: string }> - HTML content and suggested filename
   */
  async crawlHtmlForDownload(downloadQuery: DownloadHtmlQueryDto): Promise<{ html: string, filename: string }> {
    const { url, timeout, userAgent, filename, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle } = downloadQuery;
    
    console.log(`🔍 [CrawlerService] [crawlHtmlForDownload] [url]:`, url);
    console.log(`🔍 [CrawlerService] [crawlHtmlForDownload] [options]:`, { 
      timeout, userAgent, filename, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle 
    });

    try {
      const options: CrawlOptions = {
        timeout: timeout || this.defaultTimeout,
        userAgent: userAgent || this.defaultUserAgent,
        headers: {},
        usePuppeteer: usePuppeteer !== false, // Default to true
        waitForSelector,
        waitTime,
        waitForNetworkIdle: waitForNetworkIdle !== false // Default to true
      };

      let html: string;
      let statusCode: number;

      // Use Puppeteer by default for better JavaScript support
      if (options.usePuppeteer) {
        try {
          const crawlResult = await this.fetchHtmlWithPuppeteer(url, options);
          html = crawlResult.html;
          statusCode = crawlResult.statusCode;
        } catch (puppeteerError) {
          console.log(`⚠️ [CrawlerService] [crawlHtmlForDownload] [puppeteer_failed_fallback_to_axios]:`, puppeteerError.message);
          
          // Fallback to axios if Puppeteer fails
          const response = await this.fetchHtml(url, options);
          html = response.data;
          statusCode = response.status;
        }
      } else {
        // Fallback to axios
        const response = await this.fetchHtml(url, options);
        html = response.data;
        statusCode = response.status;
      }
      
      // Generate filename
      const suggestedFilename = this.generateFilename(url, html, filename);
      
      console.log(`✅ [CrawlerService] [crawlHtmlForDownload] [success]:`, {
        url,
        statusCode,
        contentLength: html.length,
        filename: suggestedFilename,
        usedPuppeteer: options.usePuppeteer
      });

      return {
        html,
        filename: suggestedFilename
      };
    } catch (error) {
      console.log(`🔴 [CrawlerService] [crawlHtmlForDownload] [error]:`, error.message);
      this.handleCrawlError(error, url);
    }
  }

  /**
   * Generate filename for downloaded HTML file
   * @param url - The original URL
   * @param html - The HTML content
   * @param customFilename - Custom filename provided by user
   * @returns string - Generated filename
   */
  private generateFilename(url: string, html: string, customFilename?: string): string {
    if (customFilename) {
      return `${customFilename}.html`;
    }

    try {
      // Try to extract title from HTML
      const $ = cheerio.load(html);
      const title = $('title').text().trim();
      
      if (title) {
        // Clean title for filename
        const cleanTitle = title
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .toLowerCase()
          .substring(0, 50); // Limit length
        
        if (cleanTitle) {
          return `${cleanTitle}.html`;
        }
      }
    } catch (error) {
      console.log(`⚠️ [CrawlerService] [generateFilename] [title_extraction_error]:`, error.message);
    }

    // Fallback: generate from URL
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      const path = urlObj.pathname.replace(/\//g, '-').replace(/^-|-$/g, '');
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      return path ? `${domain}-${path}-${timestamp}.html` : `${domain}-${timestamp}.html`;
    } catch (error) {
      // Ultimate fallback
      const timestamp = new Date().toISOString().slice(0, 10);
      return `crawled-page-${timestamp}.html`;
    }
  }

  /**
   * Handle crawl errors and throw appropriate exceptions
   * @param error - The error object
   * @param url - The URL that failed
   */
  private handleCrawlError(error: any, url: string): never {
    if (error.code === 'ENOTFOUND') {
      throw new BadRequestException(`Domain not found: ${url}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new BadRequestException(`Connection refused: ${url}`);
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new BadRequestException(`Request timeout: ${url}`);
    }
    
    if (error.response?.status >= 400) {
      throw new BadRequestException(`HTTP ${error.response.status}: ${url}`);
    }
    
    // Generic error
    throw new InternalServerErrorException(`Failed to crawl URL: ${error.message}`);
  }
} 