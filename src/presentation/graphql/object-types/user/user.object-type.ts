import { Field, ObjectType } from '@nestjs/graphql';
import { MongooseBaseObjectType } from '@infrastructure/mongoose/mongoose-base';
import { PaginateDataObjectType } from '..';
import { Mixed } from '@presentation/graphql/scalar-types';

@ObjectType()
export class UserObjectType extends MongooseBaseObjectType {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  email?: string;

  password!: string;

  @Field(() => String)
  username!: string;

  @Field(() => Mixed, { nullable: true })
  totalBalance?: number;
}
@ObjectType()
export class UserPaginateObjectType extends PaginateDataObjectType(
  UserObjectType,
) {}
