import { Controller, Post, Get, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentService } from '@/business/services/comment.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from '@/api/dtos/comment.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId, CurrentUserRole } from '@/api/decorator/user.decorator';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';

@ApiTags('Comment')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create comment' })
  @ApiBearerAuth()
  @ApiBaseResponse(CommentResponseDto)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCommentDto, @CurrentUserId() userId: string) {
    const comment = await this.commentService.create(userId, dto);
    return new BaseResponse(comment);
  }

  @Get()
  @ApiOperation({ summary: 'List comments by source' })
  @ApiQuery({ name: 'sourceType', enum: ['blog', 'forum_thread'] })
  @ApiQuery({ name: 'sourceId', type: String })
  @ApiBaseResponse(CommentResponseDto, { isArray: true })
  async list(@Query('sourceType') sourceType: string, @Query('sourceId') sourceId: string) {
    const data = await this.commentService.findBySource(sourceType, sourceId);
    return new BaseResponse(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update own comment' })
  @ApiBearerAuth()
  @ApiBaseResponse(CommentResponseDto)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    const comment = await this.commentService.update(id, userId, dto, isAdmin);
    return new BaseResponse(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own comment' })
  @ApiBearerAuth()
  @ApiBaseResponse()
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUserId() userId: string, @CurrentUserRole() userRole: string) {
    const isAdmin = userRole === 'admin';
    await this.commentService.remove(id, userId, isAdmin);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 