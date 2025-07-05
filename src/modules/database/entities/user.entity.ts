import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogEntity } from './blog.entity';
import { ForumThreadEntity } from './forum-thread.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'user_name' })
  user_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'avatar_url' })
  avatar_url: string;

  @Column({ type: 'varchar', length: 50, default: 'member' })
  role: string;

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @OneToMany(() => ForumThreadEntity, (thread) => thread.user)
  threads: ForumThreadEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];
} 