import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ProcessFormat, ProcessLanguage, AiProcessingResultDto } from '../crawler/dtos/process-ai.dto';

@Injectable()
export class AiProcessingService {
  private readonly logger = new Logger(AiProcessingService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Process HTML content with AI
   * @param htmlContent - Raw HTML content
   * @param options - Processing options
   * @returns Promise<AiProcessingResultDto>
   */
  async processHtmlContent(
    htmlContent: string,
    options: {
      extractOnly?: boolean;
      language?: ProcessLanguage;
      format?: ProcessFormat;
    } = {}
  ): Promise<AiProcessingResultDto> {
    console.log(`🤖 [AiProcessingService] [processHtmlContent] [starting]:`, {
      contentLength: htmlContent.length,
      options
    });

    const startTime = Date.now();

    try {
      // If extractOnly is true, just extract without AI processing
      if (options.extractOnly) {
        return this.extractContentOnly(htmlContent, options.format);
      }

      // Process with AI
      const result = await this.processWithOpenAI(htmlContent, options);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ [AiProcessingService] [processHtmlContent] [success]:`, {
        processingTime,
        titleLength: result.title.length,
        contentLength: result.content.length,
        tagsCount: result.tags?.length || 0
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(`🔴 [AiProcessingService] [processHtmlContent] [error]:`, {
        error: error.message,
        processingTime
      });
      
      // Fallback to basic extraction if AI fails
      console.log(`⚠️ [AiProcessingService] [processHtmlContent] [fallback_to_extraction]`);
      return this.extractContentOnly(htmlContent, options.format);
    }
  }

  /**
   * Process content with OpenAI
   * @param htmlContent - Raw HTML content
   * @param options - Processing options
   * @returns Promise<AiProcessingResultDto>
   */
  private async processWithOpenAI(
    htmlContent: string,
    options: {
      language?: ProcessLanguage;
      format?: ProcessFormat;
    }
  ): Promise<AiProcessingResultDto> {
    const language = options.language || ProcessLanguage.VI;
    const format = options.format || ProcessFormat.MARKDOWN;

    // Create AI prompt based on language and format
    const prompt = this.createProcessingPrompt(htmlContent, language, format);
    
    console.log(`🤖 [AiProcessingService] [processWithOpenAI] [calling_openai]:`, {
      language,
      format,
      promptLength: prompt.length
    });

    // Call OpenAI API
    const aiResponse = await this.openaiService.generateText(prompt, {
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.3
    });

    // Parse AI response
    return this.parseAiResponse(aiResponse, format);
  }

  /**
   * Extract content without AI processing
   * @param htmlContent - Raw HTML content
   * @param format - Output format
   * @returns AiProcessingResultDto
   */
  private extractContentOnly(
    htmlContent: string,
    format?: ProcessFormat
  ): AiProcessingResultDto {
    console.log(`🔄 [AiProcessingService] [extractContentOnly] [extracting]`);

    const cheerio = require('cheerio');
    const $ = cheerio.load(htmlContent);

    // Extract title
    let title = $('title').text().trim() || 
                $('h1').first().text().trim() || 
                'Untitled Article';

    // Extract image
    let image: string | null = null;
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'article img',
      '.content img',
      '.post-content img',
      '.featured-image img',
      'img'
    ];

    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        let src = element.attr('content') || element.attr('src') || element.attr('data-src');
        if (src && !src.includes('data:image/svg')) {
          // Handle Next.js image URLs
          if (src.includes('/_next/image/')) {
            const urlMatch = src.match(/url=([^&]+)/);
            if (urlMatch) {
              src = decodeURIComponent(urlMatch[1]);
            }
          }
          // Make absolute URL if relative
          if (src.startsWith('/') && !src.startsWith('//')) {
            src = 'https://coin68.com' + src;
          }
          image = src;
          break;
        }
      }
    }

    // Extract main content
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      'main',
      '#content'
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Remove unwanted elements
        element.find('script, style, nav, header, footer, .ads, .advertisement').remove();
        content = element.text().trim();
        if (content.length > 100) break;
      }
    }

    // Fallback to body content
    if (!content || content.length < 100) {
      $('script, style, nav, header, footer').remove();
      content = $('body').text().trim();
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Format content based on requested format
    if (format === ProcessFormat.MARKDOWN) {
      content = `# ${title}\n\n${content}`;
    } else if (format === ProcessFormat.HTML) {
      content = `<h1>${title}</h1>\n<p>${content.replace(/\n\n/g, '</p>\n<p>')}</p>`;
    }

    return {
      title,
      image,
      content,
      summary: null,
      tags: null,
      metadata: {
        extractedOnly: true,
        wordCount: content.split(' ').length,
        processingMethod: 'basic_extraction'
      }
    };
  }

  /**
   * Create processing prompt for AI
   * @param htmlContent - Raw HTML content
   * @param language - Target language
   * @param format - Output format
   * @returns string
   */
  private createProcessingPrompt(
    htmlContent: string,
    language: ProcessLanguage,
    format: ProcessFormat
  ): string {
    const languageText = language === ProcessLanguage.VI ? 'tiếng Việt' : 'English';
    const formatText = format === ProcessFormat.MARKDOWN ? 'Markdown' : 
                      format === ProcessFormat.HTML ? 'clean HTML' : 'plain text';

    // Use specialized financial editor prompt for Vietnamese
    if (language === ProcessLanguage.VI) {
      return `
Bạn là một nhà báo tài chính chuyên nghiệm với 10+ năm kinh nghiệm.

**NHIỆM VỤ**: Hãy viết lại hoàn toàn nội dung bài báo dưới đây thành một bài báo TÀI CHÍNH CHUYÊN NGHIỆP của riêng bạn, bằng tiếng Việt, CHI TIẾT và ĐẦY ĐỦ.

HTML CONTENT:
${htmlContent.substring(0, 12000)} ${htmlContent.length > 12000 ? '...(truncated)' : ''}

🎯 **YÊU CẦU VIẾT BÁO:**

**1. CẤU TRÚC BÀI VIẾT:**
- **Lead**: Mở đầu hấp dẫn với thông tin quan trọng nhất
- **Body**: Phân tích chi tiết, đầy đủ thông tin
- **Background**: Bối cảnh, nguyên nhân
- **Impact**: Tác động đến thị trường, nhà đầu tư
- **Expert Opinion**: Quan điểm chuyên gia (có thể tự tạo hợp lý)
- **Outlook**: Dự báo, triển vọng

**2. NỘI DUNG CHI TIẾT:**
- Mở rộng thông tin từ bài gốc
- Thêm phân tích sâu về:
  • Nguyên nhân gây ra sự kiện
  • Tác động đến các đồng tiền khác
  • Phản ứng của thị trường
  • Ý kiến từ các chuyên gia (tự tạo hợp lý)
  • So sánh với các sự kiện tương tự trong quá khứ
- Giải thích thuật ngữ kỹ thuật cho người đọc

**3. PHONG CÁCH VIẾT:**
- Chuyên nghiệp nhưng dễ hiểu
- Sử dụng số liệu cụ thể và chính xác
- Dùng emoji phù hợp: 📈, 📉, 💰, 🔥, ⚡, 🎯, 💡
- Trích dẫn "chuyên gia" (tự tạo tên và title hợp lý)
- Câu văn mạch lạc, logic

**4. ĐỊNH DẠNG HTML:**
- Sử dụng thẻ HTML: <h2>, <h3>, <p>, <strong>, <em>
- Chia thành các section rõ ràng
- Highlight số liệu quan trọng
- Tạo bullet points với <ul><li>

**5. ĐỘ DÀI:**
- Tối thiểu 800-1200 từ
- Chi tiết, đầy đủ thông tin
- Không lặp lại nội dung

**6. TÍNH CHÂN THỰC:**
- Giữ nguyên tất cả số liệu từ bài gốc
- Không bịa đặt số liệu
- Có thể thêm context và phân tích
- **TUYỆT ĐỐI không để lộ nguồn gốc**

**7. GÓC NHÌN VIỆT NAM:**
- Liên hệ với thị trường Việt Nam nếu có thể
- Tác động đến nhà đầu tư Việt
- So sánh với tình hình trong nước

ĐỊNH DẠNG RESPONSE (JSON):
{
  "title": "🔥 Tiêu đề hấp dẫn và chi tiết với emoji",
  "image": "URL hình ảnh chính của bài viết (nếu có)",
  "content": "<h2>Tiêu đề chính</h2><p>Nội dung HTML chi tiết, đầy đủ với phân tích sâu...</p>",
  "summary": "Tóm tắt chi tiết 2-3 câu về nội dung chính",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metadata": {
    "wordCount": 1200,
    "readingTime": 5,
    "confidence": 0.95,
    "style": "professional_financial_journalism",
    "depth": "comprehensive"
  }
}

**VÍ DỤ CẤU TRÚC:**
<h2>🔥 [Tiêu đề chính]</h2>
<p><strong>Lead paragraph với thông tin quan trọng nhất...</strong></p>

<h3>📊 Diễn biến chi tiết</h3>
<p>Mô tả chi tiết sự kiện...</p>

<h3>💡 Phân tích nguyên nhân</h3>
<ul>
<li>Nguyên nhân 1</li>
<li>Nguyên nhân 2</li>
</ul>

<h3>🎯 Tác động thị trường</h3>
<p>Phân tích tác động...</p>

<h3>🔮 Triển vọng</h3>
<p>Dự báo và khuyến nghị...</p>

RESPONSE:`;
    }

    // Default prompt for English or other languages
    return `
You are a professional financial journalist with 10+ years of experience.

**TASK**: Completely rewrite the content below into a COMPREHENSIVE PROFESSIONAL FINANCIAL ARTICLE of your own, in ${languageText}, DETAILED and COMPLETE.

HTML CONTENT:
${htmlContent.substring(0, 12000)} ${htmlContent.length > 12000 ? '...(truncated)' : ''}

**REQUIREMENTS:**

**1. ARTICLE STRUCTURE:**
- **Lead**: Engaging opening with most important information
- **Body**: Detailed analysis with complete information
- **Background**: Context and causes
- **Impact**: Market and investor impact
- **Expert Opinion**: Expert views (create reasonable ones)
- **Outlook**: Forecasts and prospects

**2. DETAILED CONTENT:**
- Expand information from original article
- Add deep analysis on:
  • Root causes of the event
  • Impact on other cryptocurrencies
  • Market reactions
  • Expert opinions (create reasonable names/titles)
  • Comparisons with similar past events
- Explain technical terms for readers

**3. WRITING STYLE:**
- Professional yet accessible
- Use specific and accurate data
- Include relevant emojis: 📈, 📉, 💰, 🔥, ⚡, 🎯, 💡
- Quote "experts" (create reasonable names and titles)
- Clear, logical sentences

**4. FORMAT:**
- Use ${formatText} formatting
- Clear section divisions
- Highlight important data
- Create structured content

**5. LENGTH:**
- Minimum 800-1200 words
- Detailed and comprehensive
- No repetitive content

**6. ACCURACY:**
- Keep all original data intact
- Don't fabricate numbers
- Add context and analysis
- **NEVER reveal source**

RESPONSE FORMAT (JSON):
{
  "title": "🔥 Engaging and detailed title with emoji",
  "image": "Main article image URL (if available)",
  "content": "Comprehensive content in ${formatText} format with deep analysis...",
  "summary": "Detailed 2-3 sentence summary of main content",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metadata": {
    "wordCount": 1200,
    "readingTime": 5,
    "confidence": 0.95,
    "style": "professional_financial_journalism",
    "depth": "comprehensive"
  }
}

RESPONSE:`;
  }

  /**
   * Parse AI response to structured data
   * @param aiResponse - Raw AI response
   * @param format - Expected format
   * @returns AiProcessingResultDto
   */
  private parseAiResponse(aiResponse: string, format: ProcessFormat): AiProcessingResultDto {
    console.log(`🔄 [AiProcessingService] [parseAiResponse] [parsing]:`, {
      responseLength: aiResponse.length,
      format
    });

    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          title: parsed.title || 'Untitled Article',
          image: parsed.image || null,
          content: parsed.content || '',
          summary: parsed.summary || null,
          tags: Array.isArray(parsed.tags) ? parsed.tags : null,
          metadata: {
            ...parsed.metadata,
            aiProcessed: true,
            format,
            rawResponseLength: aiResponse.length
          }
        };
      }
    } catch (error) {
      console.log(`⚠️ [AiProcessingService] [parseAiResponse] [json_parse_failed]:`, error.message);
    }

    // Fallback: try to extract structured data from text
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let title = 'Untitled Article';
    let content = aiResponse;
    let summary = null;
    let tags = null;

    // Try to find title
    const titleLine = lines.find(line => 
      line.toLowerCase().includes('title') || 
      line.toLowerCase().includes('tiêu đề')
    );
    if (titleLine) {
      title = titleLine.replace(/^[^:]*:\s*/, '').trim();
    }

    return {
      title,
      image: null,
      content,
      summary,
      tags,
      metadata: {
        aiProcessed: true,
        format,
        fallbackParsing: true,
        rawResponseLength: aiResponse.length
      }
    };
  }
} 