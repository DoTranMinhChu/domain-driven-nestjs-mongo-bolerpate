import { Type } from '@nestjs/common';
import { HealthScheduleJobHandler } from './health.schedule-job.handler';
import { NotifyScheduleJobHandler } from './notify-user.schedule-job.handler';
import { IScheduleJobHandler } from '@schedule-job/interfaces';
import { CronExpression } from '@nestjs/schedule';
export enum EScheduleJobHandler {
  HEALTH_CHECK = 'HEALTH_CHECK',
  NOTIFY_USER = 'NOTIFY_USER',
}

export const ScheduleJobHandlerMapping: Array<{
  isInt?: true;
  /**
   * Injection token
   */
  provide: EScheduleJobHandler;
  /**
   * Type (class name) of provider (instance to be injected).
   */
  useClass: Type<IScheduleJobHandler>;

  cron?: CronExpression;
}> = [
  {
    provide: EScheduleJobHandler.HEALTH_CHECK,
    useClass: HealthScheduleJobHandler,
    isInt: true,
    cron: CronExpression.EVERY_MINUTE, // Adjust the cron expression as needed
  },
  {
    provide: EScheduleJobHandler.NOTIFY_USER,
    useClass: NotifyScheduleJobHandler,
    isInt: true,
    cron: CronExpression.EVERY_12_HOURS,
  },
];
