import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { TagEntity } from '../entities/tag.entity';

export class TagRepository extends Repository<TagEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(TagEntity, dataSource.createEntityManager());
  }
} 