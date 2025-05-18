import {
  UserLoginInputType,
  UserRegistrationInputType,
} from '@presentation/graphql/input-types/users';
import { LoginUserObjectType } from '@presentation/graphql/object-types';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';
import { EXCEPTION } from '@shared/exceptions/exception';
import { BcryptUtil } from '@shared/utils/bcrypt.util';
import { IUserRepository } from '../repositories/user.repository.interface';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

import { EAccountType } from '@shared/enums';
import { AuthService } from '@domain/auth/services/auth.service';
import { IAccessToken } from '@domain/auth/interfaces';
import { Inject } from '@nestjs/common';
import { UserRepository } from '@infrastructure/mongoose/repositories/user.repository';

export class UserLoginService {
  constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}
  async userLogin(
    userLoginInput: UserLoginInputType,
  ): Promise<LoginUserObjectType> {
    const { username, password } = userLoginInput;
    if (!username || !password) {
      throw new BadRequestException();
    }
    let user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(EXCEPTION.USERNAME_DOES_NOT_EXIST);
    }

    if (!(await BcryptUtil.compareDataWithHash(password, user.password))) {
      throw new NotFoundException(EXCEPTION.PASSWORD_OR_USERNAME_INCORRECT);
    }
    const accessTokenPayload: IAccessToken = {
      id: user._id?.toString(),
      type: EAccountType.USER,
    };

    return {
      accessToken: this.authService.generateToken(accessTokenPayload),
    };
  }
}
