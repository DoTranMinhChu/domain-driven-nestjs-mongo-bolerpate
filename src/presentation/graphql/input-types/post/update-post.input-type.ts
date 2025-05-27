import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdatePostInputType {
  @Field(() => String)
  name!: string;
}
