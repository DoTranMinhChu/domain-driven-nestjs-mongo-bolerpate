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

export interface IMongooseBaseRepository<T> {
  create(
    dto: Partial<T>,
  ): Promise<
    mongoose.IfAny<
      T,
      any,
      mongoose.Document<unknown, {}, T, {}> &
        mongoose.Default__v<mongoose.Require_id<T>>
    >
  >;
  findOneById(
    id: string | Types.ObjectId,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  findOneByCondition(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  findAll(
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

  updateOneById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  updateMany(
    filter: FilterQuery<T> | undefined,
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ): Promise<mongoose.UpdateWriteOpResult>;

  softDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ): Promise<T | null>;

  permanentlyDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ): Promise<mongoose.IfAny<
    T,
    any,
    mongoose.Document<unknown, {}, T, {}> &
      mongoose.Default__v<mongoose.Require_id<T>>
  > | null>;

  count(
    filter?: mongoose.FilterQuery<T> | undefined,
    options?: mongoose.mongo.CountOptions &
      Omit<mongoose.MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
  ): Promise<number>;
}
