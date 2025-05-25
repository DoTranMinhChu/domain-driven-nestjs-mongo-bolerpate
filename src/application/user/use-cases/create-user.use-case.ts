import { UserService } from '@domain/user/services';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(createData: Partial<UserSchema>) {
    return this.userService.create(createData);
  }
}
