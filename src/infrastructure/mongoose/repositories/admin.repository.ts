import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseBaseRepository } from '../mongoose-base';
import { AdminSchema } from '../schemas';

@Injectable()
export class AdminRepository extends MongooseBaseRepository<AdminSchema> {
  constructor(
    @InjectModel(AdminSchema.name)
    private readonly adminModel: Model<AdminSchema>,
  ) {
    super(adminModel);
  }
}