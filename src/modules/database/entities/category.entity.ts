import { Entity, Column, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogEntity } from './blog.entity';

@Entity('categories')
@Index(['slug'], { unique: true })
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
  })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];

  @OneToMany(() => BlogEntity, (blog) => blog.category)
  blogs: BlogEntity[];
} 