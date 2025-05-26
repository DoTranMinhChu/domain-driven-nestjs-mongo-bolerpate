import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { PostSchema } from '@infrastructure/mongoose/schemas';

export abstract class APostRepository extends AMongooseBaseRepository<PostSchema> {}
