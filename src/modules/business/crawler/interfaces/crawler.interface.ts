export interface CrawlResult {
  url: string;
  html: string;
  title?: string;
  statusCode: number;
  contentLength: number;
  timestamp: Date;
}

export interface CrawlOptions {
  timeout?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  usePuppeteer?: boolean;
  waitForSelector?: string;
  waitTime?: number;
  waitForNetworkIdle?: boolean;
} 