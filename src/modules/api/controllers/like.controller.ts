import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikeService } from '@/business/services/like.service';
import { ToggleLikeDto } from '@/api/dtos/like.dto';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId } from '@/api/decorator/user.decorator';

@ApiTags('Like')
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @ApiOperation({ summary: 'Toggle like' })
  @ApiBearerAuth()
  async toggle(@Body() dto: ToggleLikeDto, @CurrentUserId() userId: string) {
    const result = await this.likeService.toggle(userId, dto);
    return new BaseResponse(result);
  }
} 