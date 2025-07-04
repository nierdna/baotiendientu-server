import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { CommentRepository, BlogRepository, ForumThreadRepository } from '@/database/repositories';
import { CreateCommentDto, UpdateCommentDto } from '@/api/dtos/comment.dto';
import { CommentEntity } from '@/database/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @Inject(CommentRepository) private readonly commentRepo: CommentRepository,
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(ForumThreadRepository) private readonly threadRepo: ForumThreadRepository,
  ) {}

  private async validateSource(sourceType: string, sourceId: string) {
    if (sourceType === 'blog') {
      const blog = await this.blogRepo.findOne({ where: { id: sourceId } });
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    }
    if (sourceType === 'forum_thread') {
      const thread = await this.threadRepo.findOne({ where: { id: sourceId } });
      if (!thread) throw new NotFoundException('Thread not found');
      return thread;
    }
    throw new NotFoundException('Invalid source type');
  }

  async create(userId: string, dto: CreateCommentDto): Promise<CommentEntity> {
    await this.validateSource(dto.sourceType, dto.sourceId);
    let parent = null;
    if (dto.parentId) {
      parent = await this.commentRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }
    const comment = this.commentRepo.create({
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      user: { id: userId } as any,
      content: dto.content,
      parent,
    });
    return this.commentRepo.save(comment);
  }

  async findBySource(sourceType: string, sourceId: string): Promise<CommentEntity[]> {
    await this.validateSource(sourceType, sourceId);
    return this.commentRepo.find({
      where: { sourceType, sourceId },
      relations: ['user', 'parent'],
      order: { created_at: 'ASC' },
    });
  }

  async update(id: string, userId: string, dto: UpdateCommentDto, isAdmin = false): Promise<CommentEntity> {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: ['user'] });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!isAdmin && comment.user.id !== userId) throw new ForbiddenException('Permission denied');
    comment.content = dto.content;
    return this.commentRepo.save(comment);
  }

  async remove(id: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: ['user'] });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!isAdmin && comment.user.id !== userId) throw new ForbiddenException('Permission denied');
    await this.commentRepo.softRemove(comment);
  }
} 