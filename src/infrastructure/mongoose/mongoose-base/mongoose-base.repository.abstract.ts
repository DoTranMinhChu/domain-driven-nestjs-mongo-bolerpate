import mongoose, {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  Types,
  ProjectionType,
  MongooseQueryOptions,
} from 'mongoose';
import { MongooseUpdateOptions } from './mongoose-base.schema';
import { IQueryGetListInputType } from '@shared/interfaces/query-list-input.interface';
import { IPaginatedResult, MDoc, IFindAllResult } from '../interfaces';

// Generic Document Wrapper

export abstract class AMongooseBaseRepository<T> {
  abstract fetch(
    queryInput?: IQueryGetListInputType,
    select?: string,
  ): Promise<IPaginatedResult<T>>;

  abstract create(dto: Partial<T>): Promise<MDoc<T>>;

  abstract findOneById(id: string | Types.ObjectId): Promise<MDoc<T> | null>;

  abstract findOneByCondition(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<MDoc<T> | null>;

  abstract findAll(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?:
      | (mongoose.mongo.CountOptions &
          Omit<MongooseQueryOptions<T>, 'lean' | 'timestamps'>)
      | QueryOptions<T>
      | null,
  ): Promise<IFindAllResult<T>>;

  abstract updateOneById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<MDoc<T> | null>;

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
  ): Promise<MDoc<T> | null>;

  abstract count(
    filter?: FilterQuery<T> | undefined,
    options?: mongoose.mongo.CountOptions &
      Omit<mongoose.MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
  ): Promise<number>;
}
