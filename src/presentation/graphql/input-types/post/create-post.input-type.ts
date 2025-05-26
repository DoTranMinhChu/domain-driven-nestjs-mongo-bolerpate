import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePostInputType {
  @Field(() => String)
  name!: string;
}
