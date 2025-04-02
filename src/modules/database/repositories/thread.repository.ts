import { DataSource, Repository } from 'typeorm';
import { Thread } from '../entities/thread.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class ThreadRepository extends Repository<Thread> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Thread, dataSource.createEntityManager());
  }

  async findByUserId(user_id: string): Promise<Thread[]> {
    return this.find({
      where: { user_id },
      order: { created_at: 'DESC' }
    });
  }

  async findThreadWithMessages(thread_id: string): Promise<Thread | null> {
    return this.findOne({
      where: { id: thread_id },
      relations: ['messages', 'messages.user']
    });
  }
}
