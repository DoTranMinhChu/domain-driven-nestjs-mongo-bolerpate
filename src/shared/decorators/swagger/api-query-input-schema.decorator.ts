import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  ApiQueryOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiQueryInputSchema(
  schema: Type<unknown>,
  options: ApiQueryOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(schema),
    ApiQuery({
      name: 'filters',
      required: false,
      style: 'deepObject',
      explode: true,
      schema: { $ref: getSchemaPath(schema) },
      ...options,
    }),
  );
}
