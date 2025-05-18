import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserSchema } from '../schemas/user.schema';
import { MongooseBaseRepository } from '../mongoose-base.repository';

@Injectable()
export class UserRepository extends MongooseBaseRepository<UserSchema> {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,
  ) {
    super(userModel);
  }
  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }
}
