import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('articles')
@Index(['url'], { unique: true }) // Unique index on URL to prevent duplicates
@Index(['title']) // Index on title for search
@Index(['date']) // Index on date for sorting
export class ArticleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  detailContent: string;

  @Column({ type: 'boolean', default: false })
  @Index() // Index for querying uncrawled articles
  isCrawledDetail: boolean;

  @Column({ type: 'timestamp', nullable: true })
  crawledDetailAt: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  url: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  date: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 200, default: 'coin68.com' })
  source: string;

  @Column({ type: 'varchar', length: 50, default: 'published' })
  status: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 