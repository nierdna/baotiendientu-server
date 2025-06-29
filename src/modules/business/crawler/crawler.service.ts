import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { CrawlResult, CrawlOptions } from './interfaces/crawler.interface';
import { CrawlRequestDto } from './dtos/crawl-request.dto';
import { DownloadHtmlQueryDto } from './dtos/download-html-query.dto';
import { ExtractArticlesRequestDto, ExtractArticlesResponseDto, ArticleItemDto } from './dtos/extract-articles.dto';

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
    const { 
      url, timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls 
    } = crawlRequest;
    
    console.log(`🔍 [CrawlerService] [crawlUrl] [url]:`, url);
    console.log(`🔍 [CrawlerService] [crawlUrl] [options]:`, { 
      timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls 
    });

    try {
      const options: CrawlOptions = {
        timeout: timeout || this.defaultTimeout,
        userAgent: userAgent || this.defaultUserAgent,
        headers: headers || {},
        usePuppeteer: usePuppeteer !== false, // Default to true
        waitForSelector,
        waitTime,
        waitForNetworkIdle: waitForNetworkIdle !== false, // Default to true
        waitForImages: waitForImages !== false, // Default to true
        scrollToBottom: scrollToBottom !== false, // Default to true
        maxScrolls: maxScrolls || 5 // Default to 5 scrolls
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
      // Launch browser with images enabled for proper image loading
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
          // Remove --disable-images to allow images to load
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

      // Scroll to bottom to trigger lazy loading if enabled
      if (options.scrollToBottom) {
        console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [scrolling_to_bottom]:`, options.maxScrolls);
        await this.scrollToBottomAndWait(page, options.maxScrolls || 5);
      }

      // Wait for images to load if enabled
      if (options.waitForImages) {
        console.log(`🔄 [CrawlerService] [fetchHtmlWithPuppeteer] [waiting_for_images]:`, 'starting');
        await this.waitForAllImages(page);
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
   * Scroll to bottom of page gradually to trigger lazy loading
   * @param page - Puppeteer page instance
   * @param maxScrolls - Maximum number of scroll attempts
   */
  private async scrollToBottomAndWait(page: Page, maxScrolls: number = 5): Promise<void> {
    console.log(`🔄 [CrawlerService] [scrollToBottomAndWait] [starting]:`, maxScrolls);
    
    try {
      for (let i = 0; i < maxScrolls; i++) {
        console.log(`🔄 [CrawlerService] [scrollToBottomAndWait] [scroll_${i + 1}]:`, maxScrolls);
        
        // Get current scroll position
        const previousHeight = await page.evaluate(() => document.body.scrollHeight);
        
        // Scroll down gradually
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Wait for potential new content to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if new content was loaded
        const newHeight = await page.evaluate(() => document.body.scrollHeight);
        
        if (newHeight === previousHeight) {
          console.log(`✅ [CrawlerService] [scrollToBottomAndWait] [no_new_content_after_scroll]:`, i + 1);
          break; // No new content, stop scrolling
        }
      }
      
      // Scroll back to top for better content capture
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // Wait a bit after scrolling back to top
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ [CrawlerService] [scrollToBottomAndWait] [completed]:`, maxScrolls);
    } catch (error) {
      console.log(`⚠️ [CrawlerService] [scrollToBottomAndWait] [error]:`, error.message);
      // Continue anyway, scrolling is not critical
    }
  }

  /**
   * Wait for all images on page to load completely
   * @param page - Puppeteer page instance
   */
  private async waitForAllImages(page: Page): Promise<void> {
    console.log(`🔄 [CrawlerService] [waitForAllImages] [starting]:`, 'checking images');
    
    try {
      // Wait for all images to load or timeout after 15 seconds
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const images = Array.from(document.querySelectorAll('img'));
          console.log(`🔍 [Browser] [waitForAllImages] [total_images]:`, images.length);
          
          if (images.length === 0) {
            console.log(`✅ [Browser] [waitForAllImages] [no_images_found]:`, 'resolving immediately');
            resolve();
            return;
          }
          
          let loadedImages = 0;
          let errorImages = 0;
          const totalImages = images.length;
          
          const checkComplete = () => {
            if (loadedImages + errorImages >= totalImages) {
              console.log(`✅ [Browser] [waitForAllImages] [completed]:`, {
                total: totalImages,
                loaded: loadedImages,
                errors: errorImages
              });
              resolve();
            }
          };
          
          images.forEach((img, index) => {
            if (img.complete && img.naturalWidth > 0) {
              loadedImages++;
              console.log(`✅ [Browser] [waitForAllImages] [already_loaded]:`, index + 1);
            } else {
              img.onload = () => {
                loadedImages++;
                console.log(`✅ [Browser] [waitForAllImages] [image_loaded]:`, index + 1);
                checkComplete();
              };
              
              img.onerror = () => {
                errorImages++;
                console.log(`⚠️ [Browser] [waitForAllImages] [image_error]:`, index + 1);
                checkComplete();
              };
              
              // Force reload if src is empty or data URL
              if (!img.src || img.src.startsWith('data:')) {
                errorImages++;
                console.log(`⚠️ [Browser] [waitForAllImages] [invalid_src]:`, index + 1);
              }
            }
          });
          
          checkComplete();
          
          // Timeout after 15 seconds
          setTimeout(() => {
            console.log(`⚠️ [Browser] [waitForAllImages] [timeout]:`, {
              total: totalImages,
              loaded: loadedImages,
              errors: errorImages
            });
            resolve();
          }, 15000);
        });
      });
      
      console.log(`✅ [CrawlerService] [waitForAllImages] [completed]:`, 'all images processed');
    } catch (error) {
      console.log(`⚠️ [CrawlerService] [waitForAllImages] [error]:`, error.message);
      // Continue anyway, image loading is not critical for basic functionality
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
    const { 
      url, timeout, userAgent, filename, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls 
    } = downloadQuery;
    
    console.log(`🔍 [CrawlerService] [crawlHtmlForDownload] [url]:`, url);
    console.log(`🔍 [CrawlerService] [crawlHtmlForDownload] [options]:`, { 
      timeout, userAgent, filename, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls 
    });

    try {
      const options: CrawlOptions = {
        timeout: timeout || this.defaultTimeout,
        userAgent: userAgent || this.defaultUserAgent,
        headers: {},
        usePuppeteer: usePuppeteer !== false, // Default to true
        waitForSelector,
        waitTime,
        waitForNetworkIdle: waitForNetworkIdle !== false, // Default to true
        waitForImages: waitForImages !== false, // Default to true
        scrollToBottom: scrollToBottom !== false, // Default to true
        maxScrolls: maxScrolls || 5 // Default to 5 scrolls
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
   * Extract articles from HTML content
   * @param extractRequest - The extract articles request parameters
   * @returns Promise<ExtractArticlesResponseDto> - Extracted articles data
   */
  async extractArticlesFromUrl(extractRequest: ExtractArticlesRequestDto): Promise<ExtractArticlesResponseDto> {
    const startTime = Date.now();
    const { 
      url, timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls, articleSelector, maxArticles 
    } = extractRequest;
    
    console.log(`🔍 [CrawlerService] [extractArticlesFromUrl] [url]:`, url);
    console.log(`🔍 [CrawlerService] [extractArticlesFromUrl] [options]:`, { 
      timeout, userAgent, headers, usePuppeteer, waitForSelector, waitTime, waitForNetworkIdle,
      waitForImages, scrollToBottom, maxScrolls, articleSelector, maxArticles 
    });

    try {
      // First, crawl the HTML using existing method
      const crawlOptions: CrawlOptions = {
        timeout: timeout || this.defaultTimeout,
        userAgent: userAgent || this.defaultUserAgent,
        headers: headers || {},
        usePuppeteer: usePuppeteer !== false, // Default to true
        waitForSelector,
        waitTime,
        waitForNetworkIdle: waitForNetworkIdle !== false, // Default to true
        waitForImages: waitForImages !== false, // Default to true
        scrollToBottom: scrollToBottom !== false, // Default to true
        maxScrolls: maxScrolls || 5 // Default to 5 scrolls
      };

      let crawlResult: CrawlResult;
      let crawlMethod = 'axios';

      // Use Puppeteer by default for better JavaScript support
      if (crawlOptions.usePuppeteer) {
        try {
          crawlResult = await this.fetchHtmlWithPuppeteer(url, crawlOptions);
          crawlMethod = 'puppeteer';
          
          console.log(`✅ [CrawlerService] [extractArticlesFromUrl] [puppeteer_success]:`, {
            url: crawlResult.url,
            statusCode: crawlResult.statusCode,
            contentLength: crawlResult.contentLength,
            title: crawlResult.title
          });
        } catch (puppeteerError) {
          console.log(`⚠️ [CrawlerService] [extractArticlesFromUrl] [puppeteer_failed_fallback_to_axios]:`, puppeteerError.message);
          
          // Fallback to axios if Puppeteer fails
          const response = await this.fetchHtml(url, crawlOptions);
          crawlResult = this.processHtmlResponse(url, response);
          crawlMethod = 'axios-fallback';
        }
      } else {
        // Fallback to axios
        const response = await this.fetchHtml(url, crawlOptions);
        crawlResult = this.processHtmlResponse(url, response);
      }

      // Extract articles from HTML
      const articles = await this.parseArticlesFromHtml(crawlResult.html, articleSelector, maxArticles);
      const processingTime = Date.now() - startTime;

      console.log(`✅ [CrawlerService] [extractArticlesFromUrl] [extraction_complete]:`, {
        url,
        totalArticles: articles.length,
        processingTime,
        crawlMethod
      });

      return {
        sourceUrl: url,
        articles,
        totalArticles: articles.length,
        pageTitle: crawlResult.title,
        timestamp: new Date(),
        crawlMethod,
        processingTime
      };

    } catch (error) {
      console.log(`🔴 [CrawlerService] [extractArticlesFromUrl] [error]:`, error.message);
      this.handleCrawlError(error, url);
    }
  }

  /**
   * Parse articles from HTML content using cheerio
   * @param html - The HTML content to parse
   * @param customSelector - Custom CSS selector for articles
   * @param maxArticles - Maximum number of articles to extract
   * @returns Promise<ArticleItemDto[]> - Array of extracted articles
   */
  private async parseArticlesFromHtml(html: string, customSelector?: string, maxArticles: number = 50): Promise<ArticleItemDto[]> {
    console.log(`🔄 [CrawlerService] [parseArticlesFromHtml] [starting]:`, { customSelector, maxArticles });
    
    try {
      const $ = cheerio.load(html);
      const articles: ArticleItemDto[] = [];

      // Define possible selectors for articles (prioritize custom selector)
      const articleSelectors = customSelector ? [customSelector] : [
        '.MuiBox-root.css-16jnb7i', // Coin68 specific
        '.article-item',
        '.post-item',
        '.news-item',
        '.card',
        'article',
        '.entry',
        '.item'
      ];

      let foundArticles = false;

      // Try each selector until we find articles
      for (const selector of articleSelectors) {
        console.log(`🔍 [CrawlerService] [parseArticlesFromHtml] [trying_selector]:`, selector);
        
        const elements = $(selector);
        console.log(`🔍 [CrawlerService] [parseArticlesFromHtml] [found_elements]:`, elements.length);

        if (elements.length > 0) {
          foundArticles = true;
          
          elements.each((index, element) => {
            if (articles.length >= maxArticles) return false; // Break if max reached

            try {
              const article = this.extractArticleData($, $(element), index);
              if (article && article.title && (article.image || article.content)) {
                articles.push(article);
                console.log(`✅ [CrawlerService] [parseArticlesFromHtml] [extracted_article]:`, {
                  index: articles.length,
                  title: article.title.substring(0, 50) + '...',
                  hasImage: !!article.image,
                  hasContent: !!article.content
                });
              }
            } catch (error) {
              console.log(`⚠️ [CrawlerService] [parseArticlesFromHtml] [article_extraction_error]:`, {
                index,
                error: error.message
              });
            }
          });

          if (articles.length > 0) {
            console.log(`✅ [CrawlerService] [parseArticlesFromHtml] [selector_success]:`, {
              selector,
              articlesFound: articles.length
            });
            break; // Stop trying other selectors if we found articles
          }
        }
      }

      if (!foundArticles) {
        console.log(`⚠️ [CrawlerService] [parseArticlesFromHtml] [no_articles_found]:`, 'trying generic extraction');
        
        // Fallback: try to find any elements with images and titles
        const fallbackElements = $('div:has(img):has(a)').slice(0, maxArticles);
        fallbackElements.each((index, element) => {
          try {
            const article = this.extractArticleData($, $(element), index);
            if (article && article.title && (article.image || article.content)) {
              articles.push(article);
            }
          } catch (error) {
            // Ignore individual extraction errors in fallback mode
          }
        });
      }

      console.log(`✅ [CrawlerService] [parseArticlesFromHtml] [completed]:`, {
        totalArticles: articles.length,
        maxArticles
      });

      return articles;

    } catch (error) {
      console.log(`🔴 [CrawlerService] [parseArticlesFromHtml] [error]:`, error.message);
      throw new InternalServerErrorException(`Failed to parse articles: ${error.message}`);
    }
  }

  /**
   * Extract article data from a single element
   * @param $ - Cheerio instance
   * @param element - Article element
   * @param index - Element index
   * @returns ArticleItemDto | null - Extracted article data
   */
  private extractArticleData($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>, index: number): ArticleItemDto | null {
    try {
      // Extract image - prioritize real images over placeholders
      let image = '';
      const imgElements = element.find('img');
      
      if (imgElements.length > 0) {
        // Try to find the best image (avoid SVG placeholders)
        let bestImg = null;
        
        imgElements.each((_, img) => {
          const $img = $(img);
          const src = $img.attr('src') || '';
          const srcset = $img.attr('srcset') || '';
          const dataSrc = $img.attr('data-src') || '';
          
          // Skip SVG placeholders
          if (src.includes('data:image/svg+xml')) {
            return; // Continue to next image
          }
          
          // Prioritize images with srcset (Next.js images)
          if (srcset && srcset.includes('/_next/image/')) {
            bestImg = $img;
            return false; // Break the loop
          }
          
          // Prioritize images with real URLs
          if (src && (src.startsWith('http') || src.startsWith('/'))) {
            if (!bestImg) bestImg = $img;
          }
          
          // Fallback to data-src
          if (dataSrc && (dataSrc.startsWith('http') || dataSrc.startsWith('/'))) {
            if (!bestImg) bestImg = $img;
          }
        });
        
        if (bestImg) {
          // Extract image URL from the best image found
          const src = bestImg.attr('src') || '';
          const srcset = bestImg.attr('srcset') || '';
          const dataSrc = bestImg.attr('data-src') || '';
          
          // Handle srcset for better quality images (Next.js)
          if (srcset) {
            const srcsetParts = srcset.split(',');
            // Get the highest resolution (last item in srcset)
            const highestRes = srcsetParts[srcsetParts.length - 1];
            if (highestRes) {
              const srcMatch = highestRes.trim().split(' ')[0];
              if (srcMatch) image = srcMatch;
            }
          }
          
          // Fallback to src
          if (!image && src) {
            image = src;
          }
          
          // Fallback to data-src
          if (!image && dataSrc) {
            image = dataSrc;
          }
          
          // Convert relative URLs to absolute
          if (image && image.startsWith('/')) {
            const baseUrl = new URL('https://coin68.com');
            image = new URL(image, baseUrl).href;
          }
          
          // Decode Next.js image URLs
          if (image && image.includes('/_next/image/?url=')) {
            try {
              const urlMatch = image.match(/url=([^&]+)/);
              if (urlMatch) {
                const decodedUrl = decodeURIComponent(urlMatch[1]);
                image = decodedUrl;
                console.log(`🔍 [CrawlerService] [extractArticleData] [decoded_nextjs_image]:`, {
                  original: image,
                  decoded: decodedUrl
                });
              }
            } catch (error) {
              console.log(`⚠️ [CrawlerService] [extractArticleData] [decode_error]:`, error.message);
              // Keep original image URL if decoding fails
            }
          }
        }
      }

      // Extract title
      let title = '';
      const titleSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.title', '[class*="title"]', 'a[title]'];
      for (const selector of titleSelectors) {
        const titleElement = element.find(selector).first();
        if (titleElement.length > 0) {
          title = titleElement.text().trim() || titleElement.attr('title') || '';
          if (title) break;
        }
      }

      // Extract content/description
      let content = '';
      const contentSelectors = ['.description', '.summary', '.excerpt', '.content', 'p', '.MuiTypography-bodyRegular'];
      for (const selector of contentSelectors) {
        const contentElement = element.find(selector).first();
        if (contentElement.length > 0) {
          content = contentElement.text().trim();
          if (content && content.length > 20) break; // Only use substantial content
        }
      }

      // Extract URL
      let articleUrl = '';
      const linkElement = element.find('a').first();
      if (linkElement.length > 0) {
        articleUrl = linkElement.attr('href') || '';
      }

      // Extract date
      let date = '';
      const dateSelectors = ['.date', '.time', '[class*="date"]', '[class*="time"]', '.MuiTypography-metaRegular'];
      for (const selector of dateSelectors) {
        const dateElement = element.find(selector).first();
        if (dateElement.length > 0) {
          date = dateElement.text().trim();
          if (date) break;
        }
      }

      // Extract category
      let category = '';
      const categorySelectors = ['.category', '.tag', '[class*="category"]', '[class*="tag"]', '.MuiTypography-tag'];
      for (const selector of categorySelectors) {
        const categoryElement = element.find(selector).first();
        if (categoryElement.length > 0) {
          category = categoryElement.text().trim();
          if (category) break;
        }
      }

      // Validate required fields
      if (!title) {
        console.log(`⚠️ [CrawlerService] [extractArticleData] [missing_title]:`, index);
        return null;
      }

      const article: ArticleItemDto = {
        image: image || '',
        title: title,
        content: content || '',
        url: articleUrl || undefined,
        date: date || undefined,
        category: category || undefined
      };

      return article;

    } catch (error) {
      console.log(`🔴 [CrawlerService] [extractArticleData] [error]:`, {
        index,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Crawl detailed content from a specific article URL
   * @param url - The article URL to crawl
   * @param options - Optional crawl options
   * @returns Promise<string> - The full HTML content
   */
  async crawlArticleDetail(url: string, options?: Partial<CrawlOptions>): Promise<string> {
    console.log(`🔍 [CrawlerService] [crawlArticleDetail] [url]:`, url);

    try {
      // Build full URL if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `https://coin68.com${url}`;
      
      const crawlOptions: CrawlOptions = {
        timeout: 45000, // Longer timeout for detailed content
        userAgent: this.defaultUserAgent,
        headers: {},
        usePuppeteer: true, // Always use Puppeteer for detailed content
        waitForNetworkIdle: true,
        waitForImages: false, // Don't wait for images for content extraction
        scrollToBottom: false, // Don't need to scroll for article content
        maxScrolls: 0,
        waitTime: 3000, // Wait for content to load
        ...options
      };

      // Use Puppeteer to get the full HTML content
      const crawlResult = await this.fetchHtmlWithPuppeteer(fullUrl, crawlOptions);
      
      console.log(`✅ [CrawlerService] [crawlArticleDetail] [success]:`, {
        url: fullUrl,
        htmlLength: crawlResult.html.length,
        title: crawlResult.title
      });

      // Return the full HTML content
      return crawlResult.html;

    } catch (error) {
      console.log(`🔴 [CrawlerService] [crawlArticleDetail] [error]:`, {
        url,
        error: error.message
      });
      throw new InternalServerErrorException(`Failed to crawl article detail: ${error.message}`);
    }
  }

  /**
   * Extract main article content from HTML
   * @param html - The HTML content
   * @returns string - The extracted article content
   */
  private extractMainArticleContent(html: string): string {
    console.log(`🔄 [CrawlerService] [extractMainArticleContent] [starting]`);

    try {
      const $ = cheerio.load(html);
      
      // Common selectors for article content (prioritized)
      const contentSelectors = [
        'article .content',
        'article .post-content',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content-body',
        'article',
        '.main-content',
        '#content',
        '.content'
      ];

      let extractedContent = '';

      // Try each selector until we find content
      for (const selector of contentSelectors) {
        const contentElement = $(selector).first();
        if (contentElement.length > 0) {
          // Remove unwanted elements
          contentElement.find('script, style, nav, header, footer, .advertisement, .ads, .social-share, .related-posts').remove();
          
          // Get text content
          extractedContent = contentElement.text().trim();
          
          if (extractedContent.length > 100) { // Minimum content length
            console.log(`✅ [CrawlerService] [extractMainArticleContent] [found_content]:`, {
              selector,
              contentLength: extractedContent.length
            });
            break;
          }
        }
      }

      // Fallback: try to get content from paragraphs
      if (!extractedContent || extractedContent.length < 100) {
        const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
        extractedContent = paragraphs.filter(p => p.length > 20).join('\n\n');
        
        console.log(`⚠️ [CrawlerService] [extractMainArticleContent] [fallback_paragraphs]:`, {
          paragraphCount: paragraphs.length,
          contentLength: extractedContent.length
        });
      }

      // Clean up the content
      extractedContent = extractedContent
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();

      console.log(`✅ [CrawlerService] [extractMainArticleContent] [completed]:`, {
        finalContentLength: extractedContent.length
      });

      return extractedContent;

    } catch (error) {
      console.log(`🔴 [CrawlerService] [extractMainArticleContent] [error]:`, error.message);
      return ''; // Return empty string if extraction fails
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