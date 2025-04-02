import { DataSource, Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class MessageRepository extends Repository<Message> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  async findByThreadId(thread_id: string): Promise<Message[]> {
    return this.find({
      where: { thread_id },
      relations: ['user'],
      order: { created_at: 'ASC' }
    });
  }

  async findByUserId(user_id: string): Promise<Message[]> {
    return this.find({
      where: { user_id },
      relations: ['thread'],
      order: { created_at: 'DESC' }
    });
  }
} 