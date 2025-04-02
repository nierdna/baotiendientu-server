import { Body, Controller, Post, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ThreadService } from '@/business/services';
import { CreateThreadDto, ThreadResponseDto } from '@/api/dtos';
import { CurrentUserId } from '../decorator/user.decorator';
import { User } from '@/database/entities';

@ApiTags('Thread')
@Controller('thread')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiResponse({
    status: 201,
    description: 'Thread created successfully',
    type: ThreadResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request'
  })
  async createThread(
    @Body() createThreadDto: CreateThreadDto,
    @CurrentUserId() userId: string
  ) {
    try {
      console.log(`✅ [ThreadController] [createThread] createThreadDto:`, createThreadDto);
      console.log(`✅ [ThreadController] [createThread] userId:`, userId);
      
      if (!userId) {
        console.log(`🔴 [ThreadController] [createThread] userId is null or undefined`);
        throw new UnauthorizedException('User not authenticated properly');
      }
      
      const thread = await this.threadService.createThread(userId, createThreadDto);
      
      console.log(`✅ [ThreadController] [createThread] thread created:`, thread);
      
      return thread;
    } catch (error) {
      console.log(`🔴 [ThreadController] [createThread] error:`, error);
      throw error;
    }
  }
} 