import { UserRegistrationInputType } from '@presentation/graphql/input-types/users';
import { LoginUserObjectType } from '@presentation/graphql/object-types';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';
import { EXCEPTION } from '@shared/exceptions/exception';
import { BcryptUtil } from '@shared/utils/bcrypt.util';
import { IUserRepository } from '../repositories/user.repository.interface';
import { UserLoginService } from './user-login.service';

export class UserRegistrationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userLoginService: UserLoginService,
  ) {}
  async userRegistration(
    registerRequest: UserRegistrationInputType,
  ): Promise<LoginUserObjectType> {
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
