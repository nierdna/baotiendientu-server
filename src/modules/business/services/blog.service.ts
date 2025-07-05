import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { BlogRepository } from '@/database/repositories/blog.repository';
import { CategoryRepository } from '@/database/repositories/category.repository';
import { UserRepository } from '@/database/repositories/user.repository';
import { CreateBlogDto, UpdateBlogDto } from '@/api/dtos/blog.dto';
import { BlogEntity } from '@/database/entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @Inject(BlogRepository) private readonly blogRepo: BlogRepository,
    @Inject(CategoryRepository) private readonly categoryRepo: CategoryRepository,
    @Inject(UserRepository) private readonly userRepo: UserRepository,
  ) {}

  async create(userId: string, dto: CreateBlogDto): Promise<BlogEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let category = null;
    if (dto.category_id) {
      category = await this.categoryRepo.findOne({ where: { id: dto.category_id } });
      if (!category) throw new NotFoundException('Category not found');
    }

    const blog = this.blogRepo.create({
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt,
      thumbnail_url: dto.thumbnail_url,
      meta_title: dto.meta_title,
      meta_description: dto.meta_description,
      author: user,
      category,
      is_published: false,
      like_count: 0,
      view_count: 0,
    });

    return this.blogRepo.save(blog);
  }

  async findAll(page = 1, limit = 10): Promise<{ blogs: BlogEntity[]; total: number }> {
    const [blogs, total] = await this.blogRepo.findAndCount({
      relations: ['author', 'category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { blogs, total };
  }

  async findOne(id: string): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    // Increment view count
    blog.view_count += 1;
    await this.blogRepo.save(blog);

    return blog;
  }

  async update(id: string, userId: string, dto: UpdateBlogDto, isAdmin = false): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    // Check permissions
    if (!isAdmin && blog.author?.id !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    // Update category if provided
    if (dto.category_id) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.category_id } });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    // Update fields
    if (dto.title) blog.title = dto.title;
    if (dto.slug) blog.slug = dto.slug;
    if (dto.content) blog.content = dto.content;
    if (dto.excerpt !== undefined) blog.excerpt = dto.excerpt;
    if (dto.thumbnail_url !== undefined) blog.thumbnail_url = dto.thumbnail_url;
    if (dto.meta_title !== undefined) blog.meta_title = dto.meta_title;
    if (dto.meta_description !== undefined) blog.meta_description = dto.meta_description;
    if (dto.is_published !== undefined) blog.is_published = dto.is_published;

    // Set published_at if publishing
    if (dto.is_published && !blog.is_published) {
      blog.published_at = new Date();
    }

    return this.blogRepo.save(blog);
  }

  async remove(id: string, userId: string, isAdmin = false): Promise<void> {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    // Check permissions
    if (!isAdmin && blog.author?.id !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    await this.blogRepo.softRemove(blog);
  }

  async publish(id: string, userId: string, isAdmin = false): Promise<BlogEntity> {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    // Check permissions
    if (!isAdmin && blog.author?.id !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    blog.is_published = true;
    blog.published_at = new Date();

    return this.blogRepo.save(blog);
  }
} 