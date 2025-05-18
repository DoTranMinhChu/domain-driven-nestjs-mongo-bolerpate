import { AuthService } from '@domain/auth/services/auth.service';
import { MongooseBaseService } from '@infrastructure/mongoose';
import { UserRepository } from '@infrastructure/mongoose/repositories/user.repository';
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
