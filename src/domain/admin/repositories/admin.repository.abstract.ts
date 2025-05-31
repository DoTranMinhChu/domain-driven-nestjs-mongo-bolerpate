import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { AdminSchema } from '@infrastructure/mongoose/schemas';

export abstract class AAdminRepository extends AMongooseBaseRepository<AdminSchema> {}