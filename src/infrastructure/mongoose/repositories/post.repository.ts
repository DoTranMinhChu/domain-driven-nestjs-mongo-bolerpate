import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Model } from 'mongoose';
import { MongooseBaseRepository } from '../mongoose-base';
import { PostSchema } from '../schemas';

@Injectable()
export class PostRepository extends MongooseBaseRepository<PostSchema> {
  constructor(
    @InjectModel(PostSchema.name)
    private readonly postModel: Model<PostSchema>,
  ) {
    super(postModel);
  }
}
