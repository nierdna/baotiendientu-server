import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ForumEntity } from '../entities/forum.entity';

export class ForumRepository extends Repository<ForumEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ForumEntity, dataSource.createEntityManager());
  }
} 