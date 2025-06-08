import { Injectable } from '@nestjs/common';
import { UserLoginService } from '@domain/user/services/user-login.service';
import { UserLoginInputDTO } from '../dto';
import { EVENT_KEY, TypedEventEmitter, UserLoginEventPublisher } from '@events';
import { UserSchema } from '@infrastructure/mongoose/schemas';

@Injectable()
export class UserLoginUseCase {
  constructor(
    private readonly userLoginService: UserLoginService,
    private readonly events: TypedEventEmitter,
  ) {}
  async execute(userLoginInput: UserLoginInputDTO) {
    const userLoginResult =
      await this.userLoginService.userLogin(userLoginInput);

    this.events.emit(
      EVENT_KEY.USER.LOGIN,
      new UserLoginEventPublisher({
        userSchema: (userLoginResult.user as UserSchema)!,
      }),
    );
    return userLoginResult;
  }
}
