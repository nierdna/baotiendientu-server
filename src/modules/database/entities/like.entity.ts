import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('likes')
@Index(['sourceType', 'sourceId', 'user'], { unique: true })
export class LikeEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  sourceType: string; // e.g., 'blog', 'forum_thread'

  @Column({ type: 'uuid' })
  sourceId: string;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;
} 