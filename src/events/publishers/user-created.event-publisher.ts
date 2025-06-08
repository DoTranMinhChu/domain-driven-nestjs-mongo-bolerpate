import { UserSchema } from '@infrastructure/mongoose/schemas';

export class UserCreatedEventPublisher {
  userSchema!: UserSchema;

  constructor(data: UserCreatedEventPublisher) {
    Object.assign(this, data);
  }
}
