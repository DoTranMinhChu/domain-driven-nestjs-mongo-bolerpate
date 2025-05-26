import { PostService } from '@domain/post/services';
import { PostSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class GetOnePostByConditionUseCase {
  constructor(private readonly postService: PostService) {}

  async execute(condition: FilterQuery<PostSchema>) {
    return this.postService.findOne(condition);
  }
}
