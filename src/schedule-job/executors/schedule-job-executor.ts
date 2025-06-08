import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ScheduleJobRepository } from '@infrastructure/mongoose/repositories';
import {
  EScheduleJobStatus,
  ScheduleJobSchema,
} from '@infrastructure/mongoose/schemas';
import { IScheduleJobHandler } from '@schedule-job/interfaces';

@Injectable()
export class ScheduleJobExecutor {
  private readonly logger = new Logger(ScheduleJobExecutor.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(ScheduleJobRepository.name)
    private readonly scheduleJobRepository: ScheduleJobRepository,
  ) {}

  async run(job: ScheduleJobSchema) {
    const { name, handler, payload, repeat } = job;

    // 1) Cập nhật status = RUNNING
    await this.scheduleJobRepository.updateOneWithCondition(
      { name },
      { status: EScheduleJobStatus.RUNNING, lastRunAt: new Date() },
    );

    try {
      // 2) Lấy handler động từ container
      const h = this.moduleRef.get<IScheduleJobHandler>(handler, {
        strict: false,
      });
      if (!h) throw new Error(`No handler registered for "${handler}"`);

      // 3) Thực thi
      await h.execute(payload, { jobName: name });

      // 4) Cập nhật status về COMPLETED hoặc PENDING
      await this.scheduleJobRepository.updateOneWithCondition(
        { name },
        {
          status: repeat
            ? EScheduleJobStatus.PENDING
            : EScheduleJobStatus.COMPLETED,
        },
      );
    } catch (err: any) {
      this.logger.error(`Job "${name}" failed: ${err.message}`);
      await this.scheduleJobRepository.updateOneWithCondition(
        { name },
        { status: EScheduleJobStatus.FAILED },
      );
    }
  }
}
