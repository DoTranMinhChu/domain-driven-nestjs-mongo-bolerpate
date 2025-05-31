import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateAdminInputType {
  @Field(() => String)
  name!: string;
}