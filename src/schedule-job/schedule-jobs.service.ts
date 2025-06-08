import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  EScheduleJobStatus,
  EScheduleJobType,
  ScheduleJobSchema,
} from '@infrastructure/mongoose/schemas';
import { ScheduleJobRepository } from '@infrastructure/mongoose/repositories';
import { ScheduleJobExecutor } from './executors/schedule-job-executor';

@Injectable()
export class ScheduleJobService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleJobService.name);

  constructor(
    private readonly scheduler: SchedulerRegistry,
    @Inject(ScheduleJobRepository.name)
    private readonly jobRepository: ScheduleJobRepository,
    private readonly executor: ScheduleJobExecutor,
  ) {}
  onModuleInit() {
    this.restorePendingScheduleJobs();
    this.registerStaticJobs();
  }

  private async restorePendingScheduleJobs() {
    const pendingJobs = await this.jobRepository.findAll({
      status: EScheduleJobStatus.PENDING,
    });
    for (const job of pendingJobs) {
      this.registerJob(job);
    }
  }
  private registerJob(job: ScheduleJobSchema) {
    if (job.type === EScheduleJobType.CRON) {
      const j = new CronJob(job.cron!, () => this.executor.run(job));
      this.scheduler.addCronJob(job.name, j);
      j.start();
    } else {
      const delay = job.date!.getTime() - Date.now();
      const t = setTimeout(() => {
        this.executor
          .run(job)
          .finally(() => this.scheduler.deleteTimeout(job.name));
      }, delay);
      this.scheduler.addTimeout(job.name, t);
    }
  }
  private async registerStaticJobs() {
    // chỉ tạo trên DB nếu chưa có
    if (
      !(await this.jobRepository.findOneByCondition({ name: 'HealthCheck' }))
    ) {
      await this.scheduleCron({
        cron: '*/1 * * * *',
        name: 'HealthCheck',
        handler: 'HealthCheck',
        payload: {},
      });
    }
    if (
      !(await this.jobRepository.findOneByCondition({ name: 'NotifyUser' }))
    ) {
      await this.scheduleCron({
        cron: '0 0 * * *',
        name: 'NotifyUser',
        handler: 'NotifyUser',
        payload: {},
      });
    }
  }
  /** Schedule một job chạy 1 lần */
  async scheduleOnce(
    name: string,
    date: Date,
    payload?: any,
  ): Promise<ScheduleJobSchema> {
    const job = await this.jobRepository.create({
      name,
      type: EScheduleJobType.TIMEOUT,
      date,
      payload,
      repeat: false,
      status: EScheduleJobStatus.PENDING,
    });
    this.addTimeout(job);
    return job;
  }

  /** Schedule cron (lặp) */
  async scheduleCron({
    name,
    cron,
    handler,
    payload,
  }: {
    name: string;
    cron: string;
    handler: string;
    payload?: any;
  }): Promise<ScheduleJobSchema> {
    const job = await this.jobRepository.create({
      name,
      type: EScheduleJobType.CRON,
      cron,
      payload,
      handler,
      repeat: true,
      status: EScheduleJobStatus.PENDING,
    });
    this.addCron(job);
    return job;
  }

  /** Huỷ job (cancelling) */
  async cancelScheduleJob(name: string): Promise<void> {
    if (this.scheduler.doesExist('cron', name)) {
      this.scheduler.deleteCronJob(name);
    }
    if (this.scheduler.doesExist('timeout', name)) {
      this.scheduler.deleteTimeout(name);
    }
    await this.jobRepository.updateOneWithCondition(
      { name },
      { status: EScheduleJobStatus.CANCELLED },
    );
  }

  /** Khôi phục các job PENDING (khi server restart) */

  /** Internal: thêm CronJob vào Registry */
  private addCron(job: ScheduleJobSchema) {
    // job.cron ở đây là chuỗi cron expression e.g. '0 3 * * *'
    const cronJob = new CronJob(job.cron!, async () => {
      await this.execute(job);
    });
    this.scheduler.addCronJob(job.name, cronJob);
    cronJob.start();
    // Cập nhật nextRunAt nếu bạn muốn lưu vào DB
  }

  /** Internal: thêm Timeout vào Registry */
  private addTimeout(job: ScheduleJobSchema) {
    const delay = job.date!.getTime() - Date.now();
    if (delay <= 0) {
      this.logger.warn(`Job ${job.name} scheduled time is in the past`);
      return;
    }
    const timeout = setTimeout(async () => {
      await this.execute(job);
      // nếu không lặp thì xoá registry
      this.scheduler.deleteTimeout(job.name);
    }, delay);
    this.scheduler.addTimeout(job.name, timeout);
  }

  /** Thực thi khi tới lúc chạy job */
  private async execute(job: ScheduleJobSchema) {
    try {
      await this.jobRepository.updateOneWithCondition(
        { name: job.name },
        { status: EScheduleJobStatus.RUNNING, lastRunAt: new Date() },
      );

      // TODO: Gọi logic business
      // await this.doWork(job.payload);

      // Hoàn tất
      const updates: Partial<ScheduleJobSchema> = {
        status: job.repeat
          ? EScheduleJobStatus.PENDING
          : EScheduleJobStatus.COMPLETED,
      };
      await this.jobRepository.updateOneWithCondition(
        { name: job.name },
        updates,
      );
    } catch (err: any) {
      this.logger.error(`ScheduleJob ${job.name} failed: ${err.message}`);
      await this.jobRepository.updateOneWithCondition(
        { name: job.name },
        { status: EScheduleJobStatus.FAILED },
      );
    }
  }
}
