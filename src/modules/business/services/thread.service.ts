import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ThreadRepository } from '../../database/repositories';
import { CreateThreadDto } from '@/api/dtos';
import { Thread } from '../../database/entities';

@Injectable()
export class ThreadService {
  constructor(private readonly threadRepository: ThreadRepository) {}

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
} 