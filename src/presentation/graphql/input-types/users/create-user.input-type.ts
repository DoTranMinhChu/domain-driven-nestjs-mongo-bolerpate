import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class CreateUserInputType {
  @Field(() => String)
  name!: string;
}
