import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class OpenAIService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  /**
   * Stream a response from OpenAI API for a given question
   * @param question - The question to send to OpenAI
   * @returns Observable stream of text chunks
   */
  streamCompletion(question: string): Observable<string> {
    return new Observable<string>(observer => {
      const controller = new AbortController();
      const { signal } = controller;
      let completeResponse = ''; // Variable to collect the full response

      try {
        console.log(`✅ [OpenAIService] [streamCompletion] question:`, question);

        if (!this.apiKey) {
          console.log(`🔴 [OpenAIService] [streamCompletion] API key is missing`);
          observer.error(new Error('OpenAI API key is missing'));
          return;
        }

        // Configure request
        const headers = {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        };

        const data = {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: question }
          ],
          stream: true,
        };

        console.log(`🔍 [OpenAIService] [streamCompletion] Request data:`, JSON.stringify(data));

        // Make streaming request
        axios.post(this.apiUrl, data, {
          headers,
          signal,
          responseType: 'stream',
        }).then(response => {
          console.log(`✅ [OpenAIService] [streamCompletion] Stream connection established`);
          
          // Process stream
          response.data.on('data', (chunk: Buffer) => {
            try {
              // Parse SSE format
              const lines = chunk.toString().split('\n');
              for (const line of lines) {
                // Skip empty lines and [DONE] message
                if (!line || line === 'data: [DONE]') continue;
                
                // Only process data lines
                if (line.startsWith('data: ')) {
                  const jsonStr = line.slice(6); // Remove 'data: ' prefix
                  
                  try {
                    const json = JSON.parse(jsonStr);
                    // Extract content delta if available
                    if (json.choices && json.choices[0]?.delta?.content) {
                      const contentChunk = json.choices[0].delta.content;
                      completeResponse += contentChunk; // Add to complete response
                      console.log(`🔄 [OpenAIService] [streamCompletion] Chunk received: "${contentChunk}"`);
                      observer.next(contentChunk);
                    }
                  } catch (e) {
                    // Skip invalid JSON
                    console.log(`⚠️ [OpenAIService] [streamCompletion] Invalid JSON:`, jsonStr);
                  }
                }
              }
            } catch (error) {
              console.log(`🔴 [OpenAIService] [streamCompletion] Error processing chunk:`, error);
            }
          });

          response.data.on('end', () => {
            console.log(`✅ [OpenAIService] [streamCompletion] Stream ended`);
            console.log(`📝 [OpenAIService] [streamCompletion] Complete response: 
----- RESPONSE START -----
${completeResponse}
----- RESPONSE END -----`);
            observer.complete();
          });

          response.data.on('error', (error: Error) => {
            // console.log(`🔴 [OpenAIService] [streamCompletion] Stream error:`, error);
            // observer.error(error);
          });
        }).catch(error => {
          // Handle cancelation errors differently from other errors
          if (axios.isCancel(error)) {
            console.log(`ℹ️ [OpenAIService] [streamCompletion] Request was canceled by client`);
            if (completeResponse) {
              console.log(`📝 [OpenAIService] [streamCompletion] Partial response before cancellation: 
----- PARTIAL RESPONSE START -----
${completeResponse}
----- PARTIAL RESPONSE END -----`);
            }
            // Don't send error to observer for normal cancellations
            observer.complete();
          } else {
            // For other errors, log details and send to observer
            const axiosError = error as AxiosError;
            console.log(`🔴 [OpenAIService] [streamCompletion] Axios error:`, {
              message: axiosError.message,
              status: axiosError.response?.status,
              statusText: axiosError.response?.statusText,
              data: axiosError.response?.data
            });
            observer.error(error);
          }
        });

        // Clean up on unsubscribe
        return () => {
          console.log(`✅ [OpenAIService] [streamCompletion] Stream closed by client`);
          if (completeResponse) {
            console.log(`📝 [OpenAIService] [streamCompletion] Partial response at closure: 
----- PARTIAL RESPONSE START -----
${completeResponse}
----- PARTIAL RESPONSE END -----`);
          }
          controller.abort();
        };
      } catch (error) {
        console.log(`🔴 [OpenAIService] [streamCompletion] Error:`, error);
        observer.error(error);
      }
    });
  }
} 