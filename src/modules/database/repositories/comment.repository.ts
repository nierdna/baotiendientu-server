import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CommentEntity } from '../entities/comment.entity';

export class CommentRepository extends Repository<CommentEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(CommentEntity, dataSource.createEntityManager());
  }
} 