import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';

export class BlogRepository extends Repository<BlogEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(BlogEntity, dataSource.createEntityManager());
  }
} 