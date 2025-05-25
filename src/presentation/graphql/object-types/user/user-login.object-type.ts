import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserLoginObjectType {
  @Field(() => String)
  accessToken!: string;
}
