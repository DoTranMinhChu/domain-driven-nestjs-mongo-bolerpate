import { Injectable, Logger } from '@nestjs/common';
import { IScheduleJobHandler } from '@schedule-job/interfaces';

@Injectable()
export class NotifyScheduleJobHandler implements IScheduleJobHandler {
  private readonly logger = new Logger(NotifyScheduleJobHandler.name);

  async execute(payload: any) {
    this.logger.log(
      `🩺 Notify OK at ${new Date().toISOString()} - With payload: `,
      payload,
    );
  }
}
