import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class AdminValueObject extends ABaseValueObject<AdminSchema> {
  protected override validate(_value: AdminSchema): void {}
}