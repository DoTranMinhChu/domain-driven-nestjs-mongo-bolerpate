import { Injectable } from '@nestjs/common';
import { UserLoginService } from '@domain/user/services/user-login.service';
import { UserLoginInputDTO } from '../dto';

@Injectable()
export class UserLoginUseCase {
  constructor(private readonly userLoginService: UserLoginService) {}
  async execute(userLoginInput: UserLoginInputDTO) {
    return this.userLoginService.userLogin(userLoginInput);
  }
}
