import { Entity, Column, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
@Index(['source_type', 'source_id'])
export class CommentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, name: 'source_type' })
  source_type: string; // e.g., 'blog', 'forum_thread'

  @Column({ type: 'uuid', name: 'source_id' })
  source_id: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, { nullable: true })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'guest_name' })
  guest_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'guest_email' })
  guest_email: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.children, { nullable: true })
  parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  children: CommentEntity[];
} 