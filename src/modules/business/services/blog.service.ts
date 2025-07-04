import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { BlogRepository, CategoryRepository } from '@/database/repositories';
import { CreateBlogDto, UpdateBlogDto } from '@/api/dtos/blog.dto';
import { BlogEntity } from '@/database/entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(CategoryRepository) private readonly categoryRepo: CategoryRepository,
  ) {}

  async create(authorId: string, dto: CreateBlogDto): Promise<BlogEntity> {
    if (await this.blogRepo.findOne({ where: { slug: dto.slug } })) {
      throw new ConflictException('Slug already exists');
    }

    let category = null;
    if (dto.categoryId) {
      category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }

    const blog = this.blogRepo.create({
      ...dto,
      category,
      author: { id: authorId } as any,
      isPublished: false,
      likeCount: 0,
      viewCount: 0,
    });
    return this.blogRepo.save(blog);
  }

  async findAll(): Promise<BlogEntity[]> {
    return this.blogRepo.find({ relations: ['author', 'category'] });
  }

  async findOne(id: string): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({ where: { id }, relations: ['author', 'category'] });
    if (!blog) throw new NotFoundException('Blog not found');
    blog.viewCount += 1;
    await this.blogRepo.save(blog);
    return blog;
  }

  async update(id: string, userId: string, dto: UpdateBlogDto, isAdmin = false): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({ where: { id }, relations: ['author'] });
    if (!blog) throw new NotFoundException('Blog not found');
    if (!isAdmin && blog.author.id !== userId) throw new ForbiddenException('Permission denied');

    if (dto.slug && dto.slug !== blog.slug) {
      if (await this.blogRepo.findOne({ where: { slug: dto.slug } })) {
        throw new ConflictException('Slug already exists');
      }
    }

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    Object.assign(blog, dto);

    return this.blogRepo.save(blog);
  }

  async remove(id: string, userId: string, isAdmin = false): Promise<void> {
    const blog = await this.blogRepo.findOne({ where: { id }, relations: ['author'] });
    if (!blog) throw new NotFoundException('Blog not found');
    if (!isAdmin && blog.author.id !== userId) throw new ForbiddenException('Permission denied');

    await this.blogRepo.softRemove(blog);
  }

  async publish(id: string, userId: string, isAdmin = false): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({ where: { id }, relations: ['author'] });
    if (!blog) throw new NotFoundException('Blog not found');
    if (!isAdmin && blog.author.id !== userId) throw new ForbiddenException('Permission denied');

    blog.isPublished = true;
    blog.publishedAt = new Date();
    return this.blogRepo.save(blog);
  }
} 