import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { CategoryRepository } from '@/database/repositories';
import { CreateCategoryDto, UpdateCategoryDto } from '@/api/dtos/category.dto';
import { CategoryEntity } from '@/database/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CategoryRepository) private readonly categoryRepo: CategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    if (await this.categoryRepo.findOne({ where: { slug: dto.slug } })) {
      throw new ConflictException('Slug already exists');
    }
    let parent = null;
    if (dto.parentId) {
      parent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
    }
    const category = this.categoryRepo.create({ ...dto, parent });
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepo.find({ relations: ['parent'] });
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({ where: { id }, relations: ['parent'] });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.slug && dto.slug !== category.slug) {
      if (await this.categoryRepo.findOne({ where: { slug: dto.slug } })) {
        throw new ConflictException('Slug already exists');
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException('Parent category not found');
        category.parent = parent;
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.softRemove(category);
  }
} 