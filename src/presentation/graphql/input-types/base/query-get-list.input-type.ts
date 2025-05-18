import { InputType, Field, Int } from '@nestjs/graphql';
import { Mixed } from '@presentation/graphql/scalar-types';

@InputType()
export class QueryGetListInputType {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Mixed, { nullable: true })
  order?: any;

  @Field(() => Mixed, { nullable: true })
  filter?: any;

  @Field(() => String, { nullable: true })
  search?: string;
}
