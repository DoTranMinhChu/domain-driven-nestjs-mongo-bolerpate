import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType()
export class PagingObjectType {
  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  total!: number;
}

export function PaginateDataObjectType<T>(ItemType: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PageClass {
    @Field(() => [ItemType])
    data!: T[];

    @Field(() => Int)
    total!: number;

    @Field(() => PagingObjectType)
    pagination!: PagingObjectType;
  }

  return PageClass;
}

export class PaginateData<T> {
  data!: T[];

  total!: number;

  pagination!: PagingObjectType;
}
