import { Entity, Column, Index, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogEntity } from './blog.entity';
import { BlogTagEntity } from './blog-tag.entity';

@Entity('tags')
@Index(['slug'], { unique: true })
export class TagEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @ManyToMany(() => BlogEntity, (blog) => blog.tags)
  blogs: BlogEntity[];

  @OneToMany(() => BlogTagEntity, (blogTag) => blogTag.tag)
  blogTags: BlogTagEntity[];
} 