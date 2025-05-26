import { PostSchema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class PostValueObject extends ABaseValueObject<PostSchema> {
  protected override validate(_value: PostSchema): void {}
}
