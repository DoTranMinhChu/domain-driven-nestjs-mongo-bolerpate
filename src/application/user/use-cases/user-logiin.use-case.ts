import { Injectable } from '@nestjs/common';
import { UserLoginService } from '@domain/user/services/user-login.service';
import { UserLoginInputType } from '@presentation/graphql/input-types/users';

@Injectable()
export class UserLoginUseCase {
  constructor(private readonly userLoginService: UserLoginService) {}
  async execute(userLoginInput: UserLoginInputType) {
    return this.userLoginService.userLogin(userLoginInput);
  }
}
