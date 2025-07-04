import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryRepository extends Repository<CategoryEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager());
  }
} 