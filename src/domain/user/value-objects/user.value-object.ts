import { ABaseValueObject } from '@shared/value-objects';
import { UserEntity } from '../entities';

export class UserValueObject extends ABaseValueObject<UserEntity> {
  protected override validate(_value: UserEntity): void {}
}
