import { Entity, Column, Index, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';
import { TagEntity } from './tag.entity';
import { BlogTagEntity } from './blog-tag.entity';

@Entity('blogs')
@Index(['slug'], { unique: true })
@Index(['title'])
export class BlogEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaDescription: string;

  @ManyToOne(() => CategoryEntity, (category) => category.blogs, { nullable: true })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.blogs)
  author: UserEntity;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @OneToMany(() => BlogTagEntity, (blogTag) => blogTag.blog)
  blogTags: BlogTagEntity[];

  @ManyToMany(() => TagEntity, (tag) => tag.blogs)
  tags: TagEntity[];
} 