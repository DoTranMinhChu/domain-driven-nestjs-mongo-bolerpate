import { DomainPostModule } from '@domain/post/post.module';
import {
  CreatePostUseCase,
  DeleteOnePostByConditionUseCase,
  FetchPostUseCase,
  GetOnePostByConditionUseCase,
  UpdateOnePostByConditionUseCase,
} from './';
import { Module } from '@nestjs/common';

@Module({
  imports: [DomainPostModule],
  providers: [
    FetchPostUseCase,
    GetOnePostByConditionUseCase,
    CreatePostUseCase,
    UpdateOnePostByConditionUseCase,
    DeleteOnePostByConditionUseCase,
  ],
  exports: [
    DomainPostModule,
    FetchPostUseCase,
    GetOnePostByConditionUseCase,
    CreatePostUseCase,
    UpdateOnePostByConditionUseCase,
    DeleteOnePostByConditionUseCase,
  ],
})
export class ApplicationPostModule {}
