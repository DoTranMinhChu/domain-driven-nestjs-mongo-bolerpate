import { AuthService } from '@domain/auth/services/auth.service';
import { MongooseBaseService } from '@infrastructure/mongoose';
import { UserRepository } from '@infrastructure/mongoose/repositories/user.repository';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService extends MongooseBaseService<UserSchema> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }
}
