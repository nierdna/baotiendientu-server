import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ForumThreadRepository, ForumRepository } from '@/database/repositories';
import { CreateForumThreadDto, UpdateForumThreadDto } from '@/api/dtos/forum-thread.dto';
import { ForumThreadEntity } from '@/database/entities/forum-thread.entity';

@Injectable()
export class ForumThreadService {
  constructor(
    @Inject(ForumThreadRepository)
    private readonly forumThreadRepo: ForumThreadRepository,
    @Inject(ForumRepository)
    private readonly forumRepo: ForumRepository,
  ) {}

  async create(userId: string, dto: CreateForumThreadDto): Promise<ForumThreadEntity> {
    const forum = await this.forumRepo.findOne({ where: { id: dto.forumId } });
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const thread = this.forumThreadRepo.create({
      forum,
      user: { id: userId } as any, // only id needed
      title: dto.title,
      content: dto.content,
    });
    return this.forumThreadRepo.save(thread);
  }

  async findAll(): Promise<ForumThreadEntity[]> {
    return this.forumThreadRepo.find({ relations: ['forum', 'user'] });
  }

  async findOne(id: string): Promise<ForumThreadEntity> {
    const thread = await this.forumThreadRepo.findOne({ where: { id }, relations: ['forum', 'user'] });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
  }

  async update(id: string, userId: string, dto: UpdateForumThreadDto): Promise<ForumThreadEntity> {
    const thread = await this.forumThreadRepo.findOne({ where: { id }, relations: ['user'] });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.user.id !== userId) throw new ForbiddenException('Permission denied');

    Object.assign(thread, dto);
    return this.forumThreadRepo.save(thread);
  }

  async remove(id: string, userId: string): Promise<void> {
    const thread = await this.forumThreadRepo.findOne({ where: { id }, relations: ['user'] });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.user.id !== userId) throw new ForbiddenException('Permission denied');

    await this.forumThreadRepo.softRemove(thread);
  }
} 