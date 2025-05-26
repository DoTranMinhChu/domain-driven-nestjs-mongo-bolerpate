import { InputType, Field } from '@nestjs/graphql/dist';

@InputType()
export class UpdatePostInputType {
  @Field(() => String)
  name!: string;
}
