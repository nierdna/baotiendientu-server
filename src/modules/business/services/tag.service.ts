import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { TagRepository } from '@/database/repositories';
import { CreateTagDto, UpdateTagDto } from '@/api/dtos/tag.dto';
import { TagEntity } from '@/database/entities/tag.entity';

@Injectable()
export class TagService {
  constructor(@Inject(TagRepository) private readonly tagRepo: TagRepository) {}

  async create(dto: CreateTagDto): Promise<TagEntity> {
    if (await this.tagRepo.findOne({ where: { slug: dto.slug } })) {
      throw new ConflictException('Slug already exists');
    }
    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async findAll(): Promise<TagEntity[]> {
    return this.tagRepo.find();
  }

  async findOne(id: string): Promise<TagEntity> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<TagEntity> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    if (dto.slug && dto.slug !== tag.slug) {
      if (await this.tagRepo.findOne({ where: { slug: dto.slug } })) {
        throw new ConflictException('Slug already exists');
      }
    }
    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepo.softRemove(tag);
  }
} 