import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class UserLoginWithGoogleInputType {
  @Field(() => String)
  code!: string;
}
