import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('processed_articles')
@Index(['originalUrl'], { unique: true }) // Unique index on original URL
@Index(['title']) // Index on title for search
@Index(['status']) // Index on status
@Index(['createdAt']) // Index on creation date
export class ProcessedArticleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 1000, unique: true })
  originalUrl: string;

  @Column({ type: 'varchar', length: 50, default: 'processed' })
  status: string; // processed, failed, pending

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string;

  @Column({ type: 'varchar', length: 20, default: 'markdown' })
  format: string; // markdown, html, text

  @Column({ type: 'int', nullable: true })
  processingTime: number; // Time taken to process in milliseconds

  @Column({ type: 'varchar', length: 100, default: 'openai' })
  aiProvider: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel: string; // gpt-4, gpt-3.5-turbo, etc.

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional metadata from AI processing

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 