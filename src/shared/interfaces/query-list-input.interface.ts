import { FilterQuery, SortOrder } from 'mongoose';
export interface IQueryGetListInputType<T extends any> {
  limit?: number;

  offset?: number;

  page?: number;

  order?: { [key: string]: SortOrder };

  filter?: FilterQuery<T>;

  search?: string;
}
