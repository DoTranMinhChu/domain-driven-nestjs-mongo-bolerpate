import { PostService } from '@domain/post/services';
import { PostSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export class UpdateOnePostByConditionUseCase {
  constructor(private readonly postService: PostService) {}

  async execute(
    condition: FilterQuery<PostSchema>,
    updateData: UpdateQuery<PostSchema>,
  ) {
    return this.postService.updateOneWithCondition(condition, updateData);
  }
}
