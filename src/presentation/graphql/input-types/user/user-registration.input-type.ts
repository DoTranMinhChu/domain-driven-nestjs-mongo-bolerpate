import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class UserRegistrationInputType {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;
}
