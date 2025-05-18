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
import { IMongooseBaseRepository } from './mongoose-base.repository.interface';

export class MongooseBaseRepository<T extends MongooseBaseSchema>
  implements IMongooseBaseRepository<T>
{
  protected constructor(private readonly model: Model<T>) {
    this.model = model;
  }
  async fetch(
    queryInput: {
      limit?: number;
      offset?: number;
      page?: number;
      order?:
        | string
        | { [key: string]: mongoose.SortOrder | { $meta: any } }
        | [string, mongoose.SortOrder][]
        | null
        | undefined;
      filter?: FilterQuery<T>;
      search?: string;
    } = {},
    select?: string,
  ) {
    queryInput = { ...queryInput };
    const limit = queryInput.limit || 50;
    const skip =
      queryInput.offset || ((queryInput?.page || 1) - 1) * limit || 0;
    const order = queryInput.order;
    const search = queryInput.search;
    const query = this.model.find();

    if (search) {
      if (search.includes(' ')) {
        _.set(queryInput, 'filter.$text.$search', search);
        query.select({ _score: { $meta: 'textScore' } });
        query.sort({ _score: { $meta: 'textScore' } });
      } else {
        const textSearchIndex = this.model.schema
          .indexes()
          .filter((c: any) => _.values(c[0]!).some((d: any) => d == 'text'));
        if (textSearchIndex.length > 0) {
          const or: any[] = [];
          textSearchIndex.forEach((index) => {
            Object.keys(index[0]!).forEach((key) => {
              or.push({
                [key]: {
                  $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                  $options: 'i',
                },
              });
            });
          });
          _.set(queryInput, 'filter.$or', or);
        }
      }
    }

    if (order) {
      query.sort(order);
    }
    if (queryInput.filter) {
      const filter = JSON.parse(
        JSON.stringify(queryInput.filter).replace(
          /\"(\_\_)(\w+)\"\:/g,
          `"$$$2":`,
        ),
      );
      query.setQuery({ ...filter });
    }
    const countQuery = this.model.find().merge(query);
    query.limit(limit);
    query.skip(skip);

    if (select) {
      query.select(select);
    }

    return await Promise.all([
      query.exec().then((res) => res),
      this.model.countDocuments(queryInput.filter).then((res) => res),
      ,
    ]).then((res) => {
      return {
        data: res[0],
        total: res[1],
        pagination: {
          page: queryInput.page || 1,
          limit: limit,
          offset: skip,
          total: res[1],
        },
      };
    });
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
  async updateMany(
    filter: FilterQuery<T> = {},
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ) {
    return await this.model.updateMany(filter, update, options);
  }

  async softDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ) {
    return await this.model.findByIdAndUpdate<T>(
      id,
      {
        deletedAt: new Date(),
      },
      options,
    );
  }

  async permanentlyDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T> | null,
  ) {
    return await this.model.findByIdAndDelete(id, options);
  }

  async count(
    filter?: mongoose.FilterQuery<T> | undefined,
    options?: mongoose.mongo.CountOptions &
      Omit<mongoose.MongooseQueryOptions<T>, 'lean' | 'timestamps'>,
  ) {
    return await this.model.countDocuments(filter, options);
  }
}
