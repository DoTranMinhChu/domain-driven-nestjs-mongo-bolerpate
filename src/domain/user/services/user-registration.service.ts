import { UserRegistrationInputType } from '@presentation/graphql/input-types/user';
import { UserLoginObjectType } from '@presentation/graphql/object-types';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';
import { EXCEPTION } from '@shared/exceptions/exception';
import { BcryptUtil } from '@shared/utils/bcrypt.util';

import { UserLoginService } from './user-login.service';
import { AUserRepository } from '../repositories/user.repository.abstract';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class UserRegistrationService {
  constructor(
    @Inject(AUserRepository)
    private readonly userRepository: AUserRepository,
    private readonly userLoginService: UserLoginService,
  ) {}
  async userRegistration(
    registerRequest: UserRegistrationInputType,
  ): Promise<UserLoginObjectType> {
    const { password } = registerRequest;
    const existedUser = await this.userRepository.findByUsername(
      registerRequest.username,
    );

    if (existedUser) {
      throw new BadRequestException(EXCEPTION.USERNAME_ALREADY_REGISTERED);
    }
    registerRequest.password = await BcryptUtil.hashData(password);
    await this.userRepository.create(registerRequest);

    return await this.userLoginService.userLogin(
      Object.assign(registerRequest, { password }),
    );
  }
}
