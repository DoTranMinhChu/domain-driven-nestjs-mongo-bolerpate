import { UserService } from '@domain/user/services';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { IQueryGetListInputType } from '@shared/interfaces';

@Injectable()
export class FetchUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(queryInput: IQueryGetListInputType<UserSchema>) {
    return this.userService.fetch(queryInput);
  }
}
