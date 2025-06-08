import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ScheduleJobRepository } from '@infrastructure/mongoose/repositories';
import { ScheduleJobService } from './schedule-jobs.service';
import { HealthScheduleJobHandler } from './handlers/health.schedule-job.handler';
import { NotifyScheduleJobHandler } from './handlers/notify-user.schedule-job.handler';
import { MongooseModule } from '@nestjs/mongoose/dist';
import {
  ScheduleJobSchema,
  ScheduleJobSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { ScheduleJobExecutor } from './executors/schedule-job-executor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleJobSchema.name, schema: ScheduleJobSchemaFactory },
    ]),

    ScheduleModule.forRoot(),
  ],
  providers: [
    { provide: ScheduleJobRepository.name, useClass: ScheduleJobRepository },
    ScheduleJobExecutor,
    ScheduleJobService,
    { provide: 'HealthCheck', useClass: HealthScheduleJobHandler },
    { provide: 'NotifyUser', useClass: NotifyScheduleJobHandler },
  ],
  exports: [ScheduleJobService],
})
export class ScheduleJobsModule {}
