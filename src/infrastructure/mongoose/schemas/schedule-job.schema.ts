import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema, MongooseSchema } from '../mongoose-base';
export enum EScheduleJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
export enum EScheduleJobType {
  TIMEOUT = 'TIMEOUT',
  CRON = 'CRON',
}
@Schema({
  timestamps: true,
  collection: 'schedule-job',
})
export class ScheduleJobSchema extends MongooseBaseSchema {
  @Prop({ required: true, unique: true })
  name!: string; // duy nhất, dùng để register vào SchedulerRegistry

  @Prop({
    enum: EScheduleJobType,
    default: EScheduleJobType.TIMEOUT,
    required: true,
  })
  type!: EScheduleJobType;

  @Prop()
  date!: Date; // với timeout

  @Prop()
  cron!: string; // với cron

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: {},
  })
  payload: any;

  @Prop({ required: true })
  handler!: string;

  @Prop({ enum: EScheduleJobStatus, default: EScheduleJobStatus.PENDING })
  status!: EScheduleJobStatus;

  @Prop()
  lastRunAt?: Date;

  @Prop()
  nextRunAt?: Date; // bạn có thể tính hoặc cập nhật sau mỗi lần chạy

  @Prop({ default: false })
  repeat!: boolean; // cron lặp hay chỉ một lần
}

export const ScheduleJobSchemaFactory =
  SchemaFactory.createForClass(ScheduleJobSchema);
ScheduleJobSchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });
