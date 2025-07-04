import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ForumEntity } from './forum.entity';
import { UserEntity } from './user.entity';

@Entity('forum_threads')
export class ForumThreadEntity extends BaseEntity {
  @ManyToOne(() => ForumEntity, (forum) => forum.threads)
  forum: ForumEntity;

  @ManyToOne(() => UserEntity, (user) => user.threads)
  user: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;
} 