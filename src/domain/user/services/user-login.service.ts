import {
  UserLoginInputType,
  UserRegistrationInputType,
} from '@presentation/graphql/input-types/user';
import { UserLoginObjectType } from '@presentation/graphql/object-types';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';
import { EXCEPTION } from '@shared/exceptions/exception';
import { BcryptUtil } from '@shared/utils/bcrypt.util';

import { NotFoundException } from '@shared/exceptions/not-found.exception';

import { EAccountType } from '@shared/enums';
import { AuthService } from '@domain/auth/services/auth.service';
import { IAccessToken } from '@domain/auth/interfaces';
import { Inject, Injectable } from '@nestjs/common';

import { AUserRepository } from '../repositories/user.repository.abstract';
@Injectable()
export class UserLoginService {
  constructor(
    @Inject(AUserRepository)
    private readonly userRepository: AUserRepository,
    private readonly authService: AuthService,
  ) {}
  async userLogin(
    userLoginInput: UserLoginInputType,
  ): Promise<UserLoginObjectType> {
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
