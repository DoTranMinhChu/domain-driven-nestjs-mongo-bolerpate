import { IMongooseBaseRepository } from '@infrastructure/mongoose/mongoose-base.repository.interface';
import { UserSchema } from '@infrastructure/mongoose/schemas';

export interface IUserRepository extends IMongooseBaseRepository<UserSchema> {
  findByUsername(username: string): Promise<UserSchema>;
}
