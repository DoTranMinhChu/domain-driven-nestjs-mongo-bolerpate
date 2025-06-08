import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Model } from 'mongoose';
import { MongooseBaseRepository } from '../mongoose-base';
import { ScheduleJobSchema } from '../schemas';

@Injectable()
export class ScheduleJobRepository extends MongooseBaseRepository<ScheduleJobSchema> {
  constructor(
    @InjectModel(ScheduleJobSchema.name)
    private readonly _scheduleJobModel: Model<ScheduleJobSchema>,
  ) {
    super(_scheduleJobModel);
  }
}
