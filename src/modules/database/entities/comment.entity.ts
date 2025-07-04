import { Entity, Column, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
@Index(['sourceType', 'sourceId'])
export class CommentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  sourceType: string; // e.g., 'blog', 'forum_thread'

  @Column({ type: 'uuid' })
  sourceId: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, { nullable: true })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestEmail: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.children, { nullable: true })
  parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  children: CommentEntity[];
} 