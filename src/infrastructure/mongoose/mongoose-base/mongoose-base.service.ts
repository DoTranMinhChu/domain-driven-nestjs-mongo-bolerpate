import {
  FilterQuery,
  FlattenMaps,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { MongooseBaseObjectType } from './mongoose-base.object-type';

import { MongooseUpdateOptions } from './mongoose-base.schema';
import { NotFoundException } from '@nestjs/common';
import { EXCEPTION } from '@shared/exceptions/exception';

import { AMongooseBaseRepository } from './mongoose-base.repository.abstract';
import { IQueryGetListInputType } from '@shared/interfaces/query-list-input.interface';

export class MongooseBaseService<T extends MongooseBaseObjectType> {
  constructor(private readonly repository: AMongooseBaseRepository<T>) {}
  async fetch(query: IQueryGetListInputType<T>) {
    return await this.repository.fetch(query);
  }
  async create(createData: Partial<T | any>) {
    return await this.repository.create(createData);
  }
  async findAllAndCount(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<FindAllResponse<T | FlattenMaps<T>>> {
    return this.repository.findAllAndCount(filter, projection, options);
  }
  async findAll(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Array<T | FlattenMaps<T>>> {
    return this.repository.findAll(filter, projection, options);
  }
  async findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
    nullable = false,
  ) {
    const result = await this.repository.findOneByCondition(
      filter,
      projection,
      options,
    );
    if (!nullable && !result) {
      throw new NotFoundException(EXCEPTION.RECORD_NOT_FOUND);
    }
    return result;
  }
  async findOneById(id: string | Types.ObjectId, nullable = false) {
    const result = await this.repository.findOneById(id);
    if (!nullable && !result) {
      throw new NotFoundException(EXCEPTION.RECORD_NOT_FOUND);
    }
    return result;
  }

  async updateOneById(id: string | Types.ObjectId, updateData: UpdateQuery<T>) {
    return await this.repository.updateOneById(id, updateData);
  }
  async updateOneWithCondition(
    filter: FilterQuery<T> = {},
    updateData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ) {
    return await this.repository.updateOneWithCondition(
      filter,
      updateData,
      options,
    );
  }
  async updateMany(
    filter: FilterQuery<T> = {},
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ) {
    return await this.repository.updateMany(filter, update, options);
  }

  async softDeleteByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions<T> | null | undefined,
  ) {
    return await this.repository.softDeleteByCondition(filter, options);
  }

  async permanentlyDeleteByCondition(
    filter: FilterQuery<T>,
    options?: QueryOptions<T> | null | undefined,
  ) {
    return await this.repository.permanentlyDeleteByCondition(filter, options);
  }
}
