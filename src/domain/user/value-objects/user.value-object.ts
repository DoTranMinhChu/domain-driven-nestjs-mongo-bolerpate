import { UserSchema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class UserValueObject extends ABaseValueObject<UserSchema> {
  protected override validate(_value: UserSchema): void {}
}
