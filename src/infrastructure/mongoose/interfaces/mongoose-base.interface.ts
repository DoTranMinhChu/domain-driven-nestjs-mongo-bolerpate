import mongoose from 'mongoose';
export type MDoc<T> = mongoose.IfAny<
  T,
  any,
  mongoose.Document<unknown, {}, T> &
    mongoose.Default__v<mongoose.Require_id<T>>
>;

// Generic Pagination Result
export interface IPaginatedResult<T> {
  data: MDoc<T>[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    offset: number;
    total: number;
  };
}

// Generic Find-All Result
export interface IFindAllResult<T> {
  count: number;
  items: MDoc<T>[];
}
