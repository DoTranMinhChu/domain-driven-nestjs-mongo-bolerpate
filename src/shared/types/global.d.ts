declare global {
  type FindAllResponse<T> = { count: number; items: T[] };
}
declare module 'apollo-server-plugin-base';
export {};
