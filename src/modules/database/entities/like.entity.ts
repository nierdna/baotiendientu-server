import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('likes')
@Index(['source_type', 'source_id', 'user'], { unique: true })
export class LikeEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, name: 'source_type' })
  source_type: string; // e.g., 'blog', 'forum_thread'

  @Column({ type: 'uuid', name: 'source_id' })
  source_id: string;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;
} 