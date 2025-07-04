import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ForumThreadService } from '@/business/services/forum-thread.service';
import { CreateForumThreadDto, UpdateForumThreadDto, ForumThreadResponseDto } from '@/api/dtos/forum-thread.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId } from '@/api/decorator/user.decorator';

@ApiTags('ForumThread')
@Controller('forum-threads')
export class ForumThreadController {
  constructor(private readonly forumThreadService: ForumThreadService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum thread' })
  @ApiBearerAuth()
  @ApiBaseResponse(ForumThreadResponseDto)
  async create(
    @Body() dto: CreateForumThreadDto,
    @CurrentUserId() userId: string,
  ) {
    const thread = await this.forumThreadService.create(userId, dto);
    return new BaseResponse(thread);
  }

  @Get()
  @ApiOperation({ summary: 'List all forum threads' })
  @ApiBaseResponse(ForumThreadResponseDto, { isArray: true })
  async findAll() {
    const data = await this.forumThreadService.findAll();
    return new BaseResponse(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum thread detail' })
  @ApiBaseResponse(ForumThreadResponseDto)
  async findOne(@Param('id') id: string) {
    const thread = await this.forumThreadService.findOne(id);
    return new BaseResponse(thread);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update own forum thread' })
  @ApiBearerAuth()
  @ApiBaseResponse(ForumThreadResponseDto)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateForumThreadDto,
    @CurrentUserId() userId: string,
  ) {
    const thread = await this.forumThreadService.update(id, userId, dto);
    return new BaseResponse(thread);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own forum thread' })
  @ApiBearerAuth()
  @ApiBaseResponse(ForumThreadResponseDto)
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.forumThreadService.remove(id, userId);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 