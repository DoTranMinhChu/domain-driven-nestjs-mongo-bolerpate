import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { UserSchema } from '@infrastructure/mongoose/schemas';

export abstract class AUserRepository extends AMongooseBaseRepository<UserSchema> {
  abstract findByUsername(username: string): Promise<UserSchema>;
}
