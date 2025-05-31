import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAdminInputType {
  @Field(() => String)
  name!: string;
}