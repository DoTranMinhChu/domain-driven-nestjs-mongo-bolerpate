import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ScheduleJobRepository } from '@infrastructure/mongoose/repositories';
import { ScheduleJobService } from './schedule-jobs.service';
import { MongooseModule } from '@nestjs/mongoose/dist';
import {
  ScheduleJobSchema,
  ScheduleJobSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { ScheduleJobExecutor } from './executors/schedule-job-executor';
import { ScheduleJobHandlerMapping } from './handlers';

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
    ...ScheduleJobHandlerMapping.map(({ provide, useClass }) => ({
      provide,
      useClass,
    })),
  ],
  exports: [ScheduleJobService],
})
export class ScheduleJobsModule {}
