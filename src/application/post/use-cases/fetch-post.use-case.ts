import { PostService } from '@domain/post/services';
import { PostSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { IQueryGetListInputType } from '@shared/interfaces';

@Injectable()
export class FetchPostUseCase {
  constructor(private readonly postService: PostService) {}

  async execute(queryInput: IQueryGetListInputType<PostSchema>) {
    return this.postService.fetch(queryInput);
  }
}
