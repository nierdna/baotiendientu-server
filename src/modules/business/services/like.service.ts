import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { LikeRepository, BlogRepository, ForumThreadRepository } from '@/database/repositories';
import { ToggleLikeDto } from '@/api/dtos/like.dto';

@Injectable()
export class LikeService {
  constructor(
    @Inject(LikeRepository) private readonly likeRepo: LikeRepository,
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(ForumThreadRepository) private readonly threadRepo: ForumThreadRepository,
  ) {}

  private async updateLikeCount(sourceType: string, sourceId: string) {
    const count = await this.likeRepo.count({ where: { sourceType, sourceId } });
    if (sourceType === 'blog') {
      await this.blogRepo.update({ id: sourceId }, { likeCount: count });
    } else {
      await this.threadRepo.update({ id: sourceId }, { likeCount: count });
    }
  }

  async toggle(userId: string, dto: ToggleLikeDto): Promise<{ liked: boolean; likeCount: number }> {
    // ensure source exists
    if (dto.sourceType === 'blog') {
      if (!(await this.blogRepo.exists({ where: { id: dto.sourceId } }))) {
        throw new NotFoundException('Blog not found');
      }
    } else {
      if (!(await this.threadRepo.exists({ where: { id: dto.sourceId } }))) {
        throw new NotFoundException('Thread not found');
      }
    }

    const existing = await this.likeRepo.findOne({ where: { sourceType: dto.sourceType, sourceId: dto.sourceId, user: { id: userId } }, relations: ['user'] });
    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      await this.likeRepo.save(this.likeRepo.create({ sourceType: dto.sourceType, sourceId: dto.sourceId, user: { id: userId } as any }));
    }

    await this.updateLikeCount(dto.sourceType, dto.sourceId);
    const likeCount = await this.likeRepo.count({ where: { sourceType: dto.sourceType, sourceId: dto.sourceId } });
    return { liked: !existing, likeCount };
  }
} 