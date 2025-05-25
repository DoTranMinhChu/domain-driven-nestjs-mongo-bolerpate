import { UserService } from '@domain/user/services';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class GetOneUserByConditionUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(condition: FilterQuery<UserSchema>) {
    return this.userService.findOne(condition);
  }
}
