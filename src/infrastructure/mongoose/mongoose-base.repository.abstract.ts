import mongoose, {
  FilterQuery,
  Model,
  MongooseQueryOptions,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import {
  MongooseBaseSchema,
  MongooseUpdateOptions,
} from './mongoose-base.schema';
import _ from 'lodash';
import { QueryGetListInput } from './inputs';

export abstract class AMongooseBaseRepository<T> {
  abstract fetch(queryInput?: QueryGetListInput, select?: string): Promise<any>;
  abstract create(
    dto: Partial<T>,
  ): Promise<
    mongoose.IfAny<
      T,
      any,
      mongoose.Document<unknown, {}, T, {}> &
        mongoose.Default__v<mongoose.Require_id<T>>
    >
  >;
  abstract findOneById(
    id: string | Types.ObjectId,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  abstract findOneByCondition(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  abstract findAll(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?:
      | (mongoose.mongo.CountOptions &
          Omit<MongooseQueryOptions<T>, 'lean' | 'timestamps'>)
      | QueryOptions<T>
      | null,
  ): Promise<{
    count: number;
    items: mongoose.IfAny<
      T,
      any,
      mongoose.Document<unknown, {}, T, {}> &
        mongoose.Default__v<mongoose.Require_id<T>>
    >[];
  }>;

  abstract updateOneById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  abstract updateMany(
    filter: FilterQuery<T> | undefined,
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ): Promise<mongoose.UpdateWriteOpResult>;

  abstract softDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ): Promise<T | null>;

  abstract permanentlyDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  abstract count(
    filter?: mongoose.FilterQuery<T> | undefined,
    options?: mongoose.mongo.CountOptions &
      Omit<mongoose.MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
  ): Promise<number>;
}
