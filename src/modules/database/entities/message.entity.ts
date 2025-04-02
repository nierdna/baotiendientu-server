import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Thread } from './thread.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column({ name: 'thread_id' })
  thread_id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Thread, thread => thread.messages)
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @ManyToOne(() => User, user => user.messages)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 