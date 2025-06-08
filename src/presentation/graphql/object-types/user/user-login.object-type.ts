import { UserSchema } from '@infrastructure/mongoose/schemas';
import { ObjectType, Field } from '@nestjs/graphql';
import { UserObjectSchema } from '@presentation/api/v1/object-schemas';

import { Mixed } from '@presentation/graphql/scalar-types';

@ObjectType()
export class UserLoginObjectType {
  @Field(() => Mixed)
  user!: UserObjectSchema | UserSchema;

  @Field(() => String)
  accessToken!: string;
}
