import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ThreadRepository } from '../../database/repositories';
import { MessageRepository } from '../../database/repositories';
import { CreateThreadDto } from '@/api/dtos';
import { Thread, Message } from '../../database/entities';
import { Observable } from 'rxjs';
import { PaginateDto } from '@/shared/pagination/paginate.dto';
import { IGetPaginationResponse, paginate } from '@/shared/pagination/pagination';

@Injectable()
export class ThreadService {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly messageRepository: MessageRepository
  ) {}

  /**
   * Create a new thread
   * @param userId - ID of the user creating the thread
   * @param createThreadDto - Data for creating the thread 
   * @returns The created thread
   */
  async createThread(userId: string, createThreadDto: CreateThreadDto): Promise<Thread> {
    try {
      console.log(`✅ [ThreadService] [createThread] createThreadDto:`, createThreadDto);
      console.log(`✅ [ThreadService] [createThread] userId:`, userId);
      
      if (!userId) {
        console.log(`🔴 [ThreadService] [createThread] userId is null or undefined`);
        throw new UnauthorizedException('User not authenticated properly');
      }
      
      const thread = new Thread();
      thread.title = createThreadDto.title || 'New Thread';
      thread.user_id = userId;
      
      const savedThread = await this.threadRepository.save(thread);
      console.log(`✅ [ThreadService] [createThread] savedThread:`, savedThread);
      
      return savedThread;
    } catch (error) {
      console.log(`🔴 [ThreadService] [createThread] error:`, error);
      throw error;
    }
  }

  /**
   * Stream a message response based on a question and thread ID
   * @param userId - ID of the user requesting the stream
   * @param threadId - ID of the thread
   * @param question - The question to process
   * @returns Observable stream of text chunks
   */
  streamMessage(userId: string, threadId: string, question: string): Observable<string> {
    return new Observable<string>(observer => {
      try {
        console.log(`✅ [ThreadService] [streamMessage] threadId:`, threadId);
        console.log(`✅ [ThreadService] [streamMessage] userId:`, userId);
        console.log(`✅ [ThreadService] [streamMessage] question:`, question);
        
        if (!userId) {
          console.log(`🔴 [ThreadService] [streamMessage] userId is null or undefined`);
          observer.error(new UnauthorizedException('User not authenticated properly'));
          return;
        }

        // Store userMessage reference for later use with the AI reply
        let userMessage: Message;

        // Verify thread exists and belongs to user
        this.threadRepository.findOne({ where: { id: threadId, user_id: userId } })
          .then(async thread => {
            if (!thread) {
              console.log(`🔴 [ThreadService] [streamMessage] Thread not found or not owned by user`);
              observer.error(new Error('Thread not found or not owned by user'));
              return;
            }

            // Save user's question to database
            userMessage = new Message();
            userMessage.thread_id = threadId;
            userMessage.user_id = userId;
            userMessage.content = question;
            userMessage.is_ai = false; // Explicitly set as user message
            userMessage.parent_id = null; // User questions don't have parents
            
            try {
              userMessage = await this.messageRepository.save(userMessage);
              console.log(`✅ [ThreadService] [streamMessage] User message saved:`, userMessage.id);
            } catch (error) {
              console.log(`🔴 [ThreadService] [streamMessage] Error saving user message:`, error);
              // Continue with the stream even if saving fails
            }

            // Example implementation - In a real app, this would call an AI service
            // Here we're just simulating a streaming response
            const response = `This is a sample response to the question: "${question}"`;
            const chunks = response.split(' ');
            
            let fullResponse = '';
            let i = 0;
            const interval = setInterval(() => {
              if (i < chunks.length) {
                const chunk = chunks[i] + ' ';
                fullResponse += chunk;
                observer.next(chunk);
                i++;
              } else {
                clearInterval(interval);
                
                // Save AI response to database after stream is complete
                const aiMessage = new Message();
                aiMessage.thread_id = threadId;
                aiMessage.user_id = userId; // Keep the user ID for attribution
                aiMessage.content = fullResponse;
                aiMessage.is_ai = true; // Mark as AI message
                aiMessage.parent_id = userMessage?.id || null; // Link to the user's message
                
                this.messageRepository.save(aiMessage)
                  .then(() => {
                    console.log(`✅ [ThreadService] [streamMessage] AI message saved:`, aiMessage.id);
                    observer.complete();
                  })
                  .catch(error => {
                    console.log(`🔴 [ThreadService] [streamMessage] Error saving AI message:`, error);
                    observer.complete(); // Complete the stream even if saving fails
                  });
              }
            }, 200);

            // Clean up on unsubscribe
            return () => {
              console.log(`✅ [ThreadService] [streamMessage] Stream closed`);
              clearInterval(interval);
            };
          })
          .catch(error => {
            console.log(`🔴 [ThreadService] [streamMessage] error:`, error);
            observer.error(error);
          });
      } catch (error) {
        console.log(`🔴 [ThreadService] [streamMessage] error:`, error);
        observer.error(error);
      }
    });
  }

  /**
   * Get threads for a specific user with pagination
   * @param userId - ID of the user
   * @param paginateDto - Pagination parameters
   * @returns Paginated threads
   */
  async getThreadsByUserId(
    userId: string,
    paginateDto: PaginateDto,
  ): Promise<IGetPaginationResponse<Thread[]>> {
    try {
      console.log(`✅ [ThreadService] [getThreadsByUserId] userId:`, userId);
      console.log(`✅ [ThreadService] [getThreadsByUserId] paginateDto:`, paginateDto);
      
      if (!userId) {
        console.log(`🔴 [ThreadService] [getThreadsByUserId] userId is null or undefined`);
        throw new UnauthorizedException('User not authenticated properly');
      }
      
      const queryBuilder = this.threadRepository
        .createQueryBuilder('thread')
        .where('thread.user_id = :userId', { userId })
        .orderBy(
          paginateDto.sort_field ? `thread.${paginateDto.sort_field}` : 'thread.created_at',
          paginateDto.sort_type,
        );
      
      const result = await paginate(queryBuilder, paginateDto.page, paginateDto.take);
      console.log(`✅ [ThreadService] [getThreadsByUserId] total threads:`, result.pagination.total);
      
      return result;
    } catch (error) {
      console.log(`🔴 [ThreadService] [getThreadsByUserId] error:`, error);
      throw error;
    }
  }

  /**
   * Get messages for a specific thread with pagination
   * @param userId - ID of the user requesting messages
   * @param threadId - ID of the thread
   * @param paginateDto - Pagination parameters
   * @returns Paginated messages
   */
  async getMessagesByThreadId(
    userId: string,
    threadId: string,
    paginateDto: PaginateDto,
  ): Promise<IGetPaginationResponse<Message[]>> {
    try {
      console.log(`✅ [ThreadService] [getMessagesByThreadId] userId:`, userId);
      console.log(`✅ [ThreadService] [getMessagesByThreadId] threadId:`, threadId);
      console.log(`✅ [ThreadService] [getMessagesByThreadId] paginateDto:`, paginateDto);
      
      if (!userId) {
        console.log(`🔴 [ThreadService] [getMessagesByThreadId] userId is null or undefined`);
        throw new UnauthorizedException('User not authenticated properly');
      }
      
      // Verify thread exists and belongs to user
      const thread = await this.threadRepository.findOne({ 
        where: { id: threadId, user_id: userId } 
      });
      
      if (!thread) {
        console.log(`🔴 [ThreadService] [getMessagesByThreadId] Thread not found or not owned by user`);
        throw new Error('Thread not found or not owned by user');
      }
      
      const queryBuilder = this.messageRepository
        .createQueryBuilder('message')
        .where('message.thread_id = :threadId', { threadId })
        .orderBy(
          paginateDto.sort_field ? `message.${paginateDto.sort_field}` : 'message.created_at',
          paginateDto.sort_type,
        );
      
      const result = await paginate(queryBuilder, paginateDto.page, paginateDto.take);
      console.log(`✅ [ThreadService] [getMessagesByThreadId] total messages:`, result.pagination.total);
      
      return result;
    } catch (error) {
      console.log(`🔴 [ThreadService] [getMessagesByThreadId] error:`, error);
      throw error;
    }
  }
} 