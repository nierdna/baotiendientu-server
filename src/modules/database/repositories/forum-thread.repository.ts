import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ForumThreadEntity } from '../entities/forum-thread.entity';

export class ForumThreadRepository extends Repository<ForumThreadEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ForumThreadEntity, dataSource.createEntityManager());
  }
} 