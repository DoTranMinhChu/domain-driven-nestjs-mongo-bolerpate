import {
  FilterQuery,
  FlattenMaps,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { MongooseBaseObjectType } from './mongoose-base.object-type';
import { MongooseBaseRepository } from './mongoose-base.repository';

import { MongooseUpdateOptions } from './mongoose-base.schema';
import { NotFoundException } from '@nestjs/common';
import { EXCEPTION } from '@shared/exceptions/exception';

import { AMongooseBaseRepository } from './mongoose-base.repository.abstract';
import { IQueryGetListInputType } from '@shared/interfaces/query-list-input.interface';

export class MongooseBaseService<T extends MongooseBaseObjectType> {
  constructor(private readonly repository: AMongooseBaseRepository<T>) {}
  async fetch(query: IQueryGetListInputType) {
    return await this.repository.fetch(query);
  }
  async create(createData: T | any) {
    return await this.repository.create(createData);
  }

  async findAll(
    filter?: object,
    options?: object,
  ): Promise<FindAllResponse<T | FlattenMaps<T>>> {
    return await this.repository.findAll(filter, options);
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

  async updateMany(
    filter: FilterQuery<T> = {},
    update: UpdateQuery<T>,
    options?: MongooseUpdateOptions<T>,
  ) {
    return await this.repository.updateMany(filter, update, options);
  }

  async remove(id: string | Types.ObjectId) {
    return await this.repository.softDelete(id);
  }
}
