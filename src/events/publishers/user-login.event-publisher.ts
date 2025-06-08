import { UserSchema } from '@infrastructure/mongoose/schemas';

export class UserLoginEventPublisher {
  userSchema!: UserSchema;

  constructor(data: UserLoginEventPublisher) {
    Object.assign(this, data);
  }
}
