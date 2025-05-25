import { UserService } from '@domain/user/services';
import { UserSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { IQueryGetListInputType } from '@shared/interfaces/query-list-input.interface';

@Injectable()
export class FetchUsersUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(queryInput: IQueryGetListInputType<UserSchema>) {
    return this.userService.fetch(queryInput);
  }
}
