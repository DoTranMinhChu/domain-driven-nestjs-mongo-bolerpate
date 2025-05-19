import { MongooseBaseService } from '@infrastructure/mongoose';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Inject, Injectable } from '@nestjs/common';
import { AUserRepository } from '../repositories/user.repository.abstract';

@Injectable()
export class UserService extends MongooseBaseService<UserSchema> {
  constructor(
    @Inject(AUserRepository)
    private readonly userRepository: AUserRepository,
  ) {
    super(userRepository);
  }
}
