import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ForumThreadEntity } from './forum-thread.entity';

@Entity('forums')
@Index(['slug'], { unique: true })
export class ForumEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => ForumThreadEntity, (thread) => thread.forum)
  threads: ForumThreadEntity[];
} 