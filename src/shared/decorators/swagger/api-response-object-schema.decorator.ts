import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiResponseObjectSchema(
  dto: Type<unknown>,
  options: ApiResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(dto),
    ApiResponse({
      status: 200,
      description: 'Single item response',
      schema: { $ref: getSchemaPath(dto) },
      ...options,
    }),
  );
}
