import { Field, ObjectType } from '@nestjs/graphql';
import { MongooseBaseObjectType } from '@infrastructure/mongoose/mongoose-base';
import { PaginateDataObjectType } from '..';

@ObjectType()
export class PostObjectType extends MongooseBaseObjectType {
  @Field(() => String)
  name!: string;
}
@ObjectType()
export class PostPaginateObjectType extends PaginateDataObjectType(
  PostObjectType,
) {}
