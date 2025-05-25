import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class UpdateUserInputType {
  @Field(() => String)
  name!: string;
}
