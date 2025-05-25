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
import { AMongooseBaseRepository } from './mongoose-base.repository.abstract';
import { IQueryGetListInputType } from '@shared/interfaces/query-list-input.interface';

export class MongooseBaseRepository<T extends MongooseBaseSchema>
  implements AMongooseBaseRepository<T>
{
  protected constructor(private readonly model: Model<T>) {
    this.model = model;
  }
  async fetch(queryInput?: IQueryGetListInputType<T>, select?: string) {
    queryInput = { ...queryInput };
    const limit = queryInput.limit || 50;
    const skip =
      queryInput.offset || ((queryInput?.page || 1) - 1) * limit || 0;
    let order = queryInput.order ?? {};
    const search = queryInput.search;

    // 2. Base query và collation cho Tiếng Việt (ignore dấu, ignore case)
    // const collation = { locale: 'vi', strength: 1 };
    // let mongoQuery = this.model.find().collation(collation);

    let mongoQuery = this.model.find();
    // 3. Search
    if (search) {
      // Lấy danh sách text-indexed fields
      const textIndexes = this.model.schema
        .indexes()
        .filter(([fields]) => Object.values(fields).includes('text'))
        .map(([fields]) => Object.keys(fields))
        .flat();

      if (search.includes(' ')) {
        // Nhiều từ → dùng text search
        mongoQuery = mongoQuery
          .find({ $text: { $search: search } })
          .sort({ score: { $meta: 'textScore' } })
          .select({ score: { $meta: 'textScore' } });
      } else if (textIndexes.length) {
        // 1 từ → regex trên các field có text-index
        const orFilters: FilterQuery<T>[] = textIndexes.map((field) => {
          // build dynamic object
          const clause = { [field]: { $regex: search, $options: 'i' } };
          // TS vẫn chưa biết chắc đây là FilterQuery<T>, nên ta assert
          return clause as FilterQuery<T>;
        });
        mongoQuery = mongoQuery.find({ $or: orFilters });
      }
    }

    // 4. Filter thuần túy (filter object)
    if (queryInput.filter) {
      mongoQuery = mongoQuery.find(queryInput.filter);
    }

    // 5. Sort (order) — mặc định giảm dần theo createdAt và _id

    if (!('_id' in order)) {
      _.set(order, 'createdAt', _.get(order, 'createdAt') || -1);
      _.set(order, '_id', _.get(order, '_id') || -1);
    }
    mongoQuery = mongoQuery.sort(order as any);

    // 6. Projection (select)
    if (select) {
      mongoQuery = mongoQuery.select(select);
    }

    // 7. Tính total (không limit/skip nhưng cùng filter/search)
    // const countQuery = this.model.find().collation(collation).merge(mongoQuery);
    const countQuery = this.model.find().merge(mongoQuery);
    const total = await countQuery.countDocuments();

    // 8. Áp limit & skip và chạy query
    const data = await mongoQuery.limit(limit).skip(skip).exec();

    // 9. Trả kết quả
    return {
      data,
      total,
      pagination: {
        page: queryInput.page ?? 1,
        limit,
        offset: skip,
        total,
      },
    };
  }
  async create(dto: T | any) {
    return await this.model.create(dto);
  }

  async findOneById(id: string | Types.ObjectId) {
    const item = await this.model.findById(id);
    return item?.deletedAt ? null : item;
  }

  async findOneByCondition(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ) {
    _.set(filter, 'deletedAt', null);

    return await this.model.findOne(filter, projection, options);
  }

  async findAll(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null | undefined,
    options?:
      | (mongoose.mongo.CountOptions &
          Omit<MongooseQueryOptions<T>, 'lean' | 'timestamps'>)
      | QueryOptions<T>
      | null,
  ) {
    const [count, items] = await Promise.all([
      this.model.countDocuments(
        filter,
        options as mongoose.mongo.CountOptions &
          Omit<MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
      ),
      this.model.find(filter, projection, options as QueryOptions<T>),
    ]);

    return {
      count,
      items,
    };
  }

  async updateOneById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ) {
    const filter: FilterQuery<T> = {
      _id: id,
      deletedAt: null,
    } as FilterQuery<T>;
    return await this.model.findOneAndUpdate(filter, update, options);
  }
  async updateOneWithCondition(
    filter: FilterQuery<T> = {},
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ) {
    filter.deletedAt = null;
    return await this.model.findOneAndUpdate(filter, update, options);
  }

  async updateMany(
    filter: FilterQuery<T> = {},
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ) {
    return await this.model.updateMany(filter, update, options);
  }

  async softDeleteByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions<T> | null,
  ): Promise<T | null> {
    return await this.model.findOneAndUpdate<T>(
      filter,
      {
        deletedAt: new Date(),
      },
      options,
    );
  }

  async permanentlyDeleteByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions<T> | null,
  ) {
    return await this.model.findOneAndDelete(filter, options);
  }

  async count(
    filter?: mongoose.FilterQuery<T> | undefined,
    options?: mongoose.mongo.CountOptions &
      Omit<mongoose.MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
  ) {
    return await this.model.countDocuments(filter, options);
  }
}
