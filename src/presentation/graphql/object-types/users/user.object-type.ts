import { Field, ObjectType } from '@nestjs/graphql/dist';
import { Mixed } from '@presentation/graphql/scalar-types/mixed.scalar-type';
import { PaginateDataObjectType } from '../base/base-pagination.object-type';
import { MongooseBaseObjectType } from '@infrastructure/mongoose/mongoose-base';

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
