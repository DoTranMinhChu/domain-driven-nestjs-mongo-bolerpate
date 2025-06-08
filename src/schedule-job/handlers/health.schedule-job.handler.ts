import { Injectable, Logger } from '@nestjs/common';
import { IScheduleJobHandler } from '@schedule-job/interfaces';

@Injectable()
export class HealthScheduleJobHandler implements IScheduleJobHandler {
  private readonly logger = new Logger(HealthScheduleJobHandler.name);

  async execute() {
    this.logger.log(`🩺 Health OK at ${new Date().toISOString()}`);
  }
}
