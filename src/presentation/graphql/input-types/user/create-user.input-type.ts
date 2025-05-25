import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInputType {
  @Field(() => String)
  name!: string;
}
