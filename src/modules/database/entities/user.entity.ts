import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Message } from './message.entity';
import { Thread } from './thread.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    unique: true,
    nullable: false,
  })
  address: string;

  @Column({
    nullable: false,
    default: 0,
  })
  nonce: number;

  @OneToMany(() => Thread, thread => thread.user)
  threads: Thread[];

  @OneToMany(() => Message, message => message.user)
  messages: Message[];
}
