import { MongooseBaseService } from '@infrastructure/mongoose';
import { PostSchema } from '@infrastructure/mongoose/schemas';
import { Inject, Injectable } from '@nestjs/common';
import { APostRepository } from '../repositories/post.repository.abstract';

@Injectable()
export class PostService extends MongooseBaseService<PostSchema> {
  constructor(
    @Inject(APostRepository)
    private readonly postRepository: APostRepository,
  ) {
    super(postRepository);
  }
}
