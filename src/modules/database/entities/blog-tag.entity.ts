import { Entity, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogEntity } from './blog.entity';
import { TagEntity } from './tag.entity';

@Entity('blog_tags')
@Index(['blog', 'tag'], { unique: true })
export class BlogTagEntity extends BaseEntity {
  @ManyToOne(() => BlogEntity, (blog) => blog.blogTags, { onDelete: 'CASCADE' })
  blog: BlogEntity;

  @ManyToOne(() => TagEntity, (tag) => tag.blogTags, { onDelete: 'CASCADE' })
  tag: TagEntity;
} 