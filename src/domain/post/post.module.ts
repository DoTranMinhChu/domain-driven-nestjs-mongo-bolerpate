// src/domain/user/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PostSchema,
  PostSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { PostRepository } from '@infrastructure/mongoose/repositories';
import { APostRepository } from './repositories/post.repository.abstract';
import { PostService } from './services/post.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostSchema.name, schema: PostSchemaFactory },
    ]),
  ],
  providers: [
    { provide: APostRepository, useClass: PostRepository },
    PostService,
  ],
  exports: [APostRepository, PostService],
})
export class DomainPostModule {}
