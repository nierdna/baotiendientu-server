import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BlogTagEntity } from '../entities/blog-tag.entity';

export class BlogTagRepository extends Repository<BlogTagEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(BlogTagEntity, dataSource.createEntityManager());
  }
} 