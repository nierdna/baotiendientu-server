import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
@Entity('threads')
export class Thread extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, user => user.threads)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Message, message => message.thread)
  messages: Message[];
} 