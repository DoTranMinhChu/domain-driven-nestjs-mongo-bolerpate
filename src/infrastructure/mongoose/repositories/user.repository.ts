import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Model } from 'mongoose';
import { MongooseBaseRepository } from '../mongoose-base';
import { UserSchema } from '../schemas';

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
