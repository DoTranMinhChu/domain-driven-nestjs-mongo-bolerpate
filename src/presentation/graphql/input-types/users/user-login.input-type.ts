import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class UserLoginInputType {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;
}
