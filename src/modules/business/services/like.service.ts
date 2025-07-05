import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { LikeRepository } from '@/database/repositories/like.repository';
import { BlogRepository } from '@/database/repositories/blog.repository';
import { ForumThreadRepository } from '@/database/repositories/forum-thread.repository';
import { ToggleLikeDto } from '@/api/dtos/like.dto';

@Injectable()
export class LikeService {
  constructor(
    @Inject(LikeRepository) private readonly likeRepo: LikeRepository,
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(ForumThreadRepository) private readonly threadRepo: ForumThreadRepository,
  ) {}

  private async updateLikeCount(source_type: string, source_id: string) {
    const count = await this.likeRepo.count({ where: { source_type, source_id } });
    if (source_type === 'blog') {
      await this.blogRepo.update({ id: source_id }, { like_count: count });
    } else {
      await this.threadRepo.update({ id: source_id }, { like_count: count });
    }
  }

  async toggle(userId: string, dto: ToggleLikeDto): Promise<{ liked: boolean; like_count: number }> {
    // ensure source exists
    if (dto.source_type === 'blog') {
      if (!(await this.blogRepo.exists({ where: { id: dto.source_id } }))) {
        throw new NotFoundException('Blog not found');
      }
    } else {
      if (!(await this.threadRepo.exists({ where: { id: dto.source_id } }))) {
        throw new NotFoundException('Thread not found');
      }
    }

    const existing = await this.likeRepo.findOne({ where: { source_type: dto.source_type, source_id: dto.source_id, user: { id: userId } }, relations: ['user'] });
    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      await this.likeRepo.save(this.likeRepo.create({ source_type: dto.source_type, source_id: dto.source_id, user: { id: userId } as any }));
    }

    await this.updateLikeCount(dto.source_type, dto.source_id);
    const like_count = await this.likeRepo.count({ where: { source_type: dto.source_type, source_id: dto.source_id } });
    return { liked: !existing, like_count };
  }
} 