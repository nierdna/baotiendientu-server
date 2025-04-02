import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
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

  @Column({ name: 'is_ai', default: false })
  is_ai: boolean;
  
  @Column({ name: 'parent_id', nullable: true })
  parent_id: string;
  
  @ManyToOne(() => Message, message => message.replies)
  @JoinColumn({ name: 'parent_id' })
  parent: Message;
  
  @OneToMany(() => Message, message => message.parent)
  replies: Message[];
}