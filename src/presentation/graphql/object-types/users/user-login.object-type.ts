import { ObjectType, Field } from '@nestjs/graphql/dist';

@ObjectType()
export class LoginUserObjectType {
  @Field(() => String)
  accessToken!: string;
}
