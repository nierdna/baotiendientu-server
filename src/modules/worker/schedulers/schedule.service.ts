import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor() {}

  async onModuleInit() {
    this.logger.log(
      '🔄 [ScheduleService] [onModuleInit] [scheduler_initialized]',
    );
  }

  onApplicationBootstrap() {
    this.logger.log(
      '🔄 [ScheduleService] [onApplicationBootstrap] [scheduler_initialized]',
    );
  }
}
