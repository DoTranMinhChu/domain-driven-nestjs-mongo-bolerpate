import { UserService } from '@domain/user/services';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export class UpdateOneUserByConditionUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(
    condition: FilterQuery<UserSchema>,
    updateData: UpdateQuery<UserSchema>,
  ) {
    return this.userService.updateOneWithCondition(condition, updateData);
  }
}
