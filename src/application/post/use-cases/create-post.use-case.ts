import { PostService } from '@domain/post/services';
import { PostSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePostUseCase {
  constructor(private readonly postService: PostService) {}

  async execute(createData: Partial<PostSchema>) {
    return this.postService.create(createData);
  }
}
