import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { CommentRepository } from '@/database/repositories/comment.repository';
import { BlogRepository } from '@/database/repositories/blog.repository';
import { ForumThreadRepository } from '@/database/repositories/forum-thread.repository';
import { UserRepository } from '@/database/repositories/user.repository';
import { CreateCommentDto, UpdateCommentDto } from '@/api/dtos/comment.dto';
import { CommentEntity } from '@/database/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @Inject(CommentRepository) private readonly commentRepo: CommentRepository,
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(ForumThreadRepository) private readonly threadRepo: ForumThreadRepository,
    @Inject(UserRepository) private readonly userRepo: UserRepository,
  ) {}

  private async validateSource(source_type: string, source_id: string) {
    if (source_type === 'blog') {
      const blog = await this.blogRepo.findOne({ where: { id: source_id } });
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    }
    if (source_type === 'forum_thread') {
      const thread = await this.threadRepo.findOne({ where: { id: source_id } });
      if (!thread) throw new NotFoundException('Thread not found');
      return thread;
    }
    throw new NotFoundException('Invalid source type');
  }

  async create(userId: string, dto: CreateCommentDto): Promise<CommentEntity> {
    await this.validateSource(dto.source_type, dto.source_id);
    
    // Load actual user entity
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    let parent = null;
    if (dto.parent_id) {
      parent = await this.commentRepo.findOne({ where: { id: dto.parent_id } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }
    
    const comment = this.commentRepo.create({
      source_type: dto.source_type,
      source_id: dto.source_id,
      user,
      content: dto.content,
      parent,
    });
    return this.commentRepo.save(comment);
  }

  async findBySource(source_type: string, source_id: string): Promise<CommentEntity[]> {
    await this.validateSource(source_type, source_id);
    return this.commentRepo.find({
      where: { source_type, source_id },
      relations: ['user', 'parent'],
      order: { created_at: 'ASC' },
    });
  }

  async update(id: string, userId: string, dto: UpdateCommentDto, isAdmin = false): Promise<CommentEntity> {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: ['user'] });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!comment.user) {
      console.log(`🔴 [CommentService][update] Comment ${id} has no user!`);
      throw new NotFoundException('Comment has no user');
    }
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