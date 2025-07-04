import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';

export class LikeRepository extends Repository<LikeEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(LikeEntity, dataSource.createEntityManager());
  }
} 