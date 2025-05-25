import { ObjectType, Field } from '@nestjs/graphql/dist';

@ObjectType()
export class UserLoginObjectType {
  @Field(() => String)
  accessToken!: string;
}
