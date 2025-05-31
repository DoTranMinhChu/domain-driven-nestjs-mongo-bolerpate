import { Field, ObjectType } from '@nestjs/graphql';
import { MongooseBaseObjectType } from '@infrastructure/mongoose/mongoose-base';
import { PaginateDataObjectType } from '..';

@ObjectType()
export class AdminObjectType extends MongooseBaseObjectType {
  @Field(() => String)
  name!: string;
}
@ObjectType()
export class AdminPaginateObjectType extends PaginateDataObjectType(
  AdminObjectType,
) {}