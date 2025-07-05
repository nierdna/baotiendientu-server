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

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'thumbnail_url' })
  thumbnail_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'meta_title' })
  meta_title: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'meta_description' })
  meta_description: string;

  @ManyToOne(() => CategoryEntity, (category) => category.blogs, { nullable: true })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.blogs)
  author: UserEntity;

  @Column({ type: 'boolean', default: false, name: 'is_published' })
  is_published: boolean;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  view_count: number;

  @Column({ type: 'int', default: 0, name: 'like_count' })
  like_count: number;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  published_at: Date;

  @OneToMany(() => BlogTagEntity, (blogTag) => blogTag.blog)
  blogTags: BlogTagEntity[];

  @ManyToMany(() => TagEntity, (tag) => tag.blogs)
  tags: TagEntity[];
} 