import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiResponsePaginationObjectSchema(
  dto: Type<unknown>,
  options: ApiResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(dto),
    ApiResponse({
      status: 200,

      description: `Paginated result`,
      schema: {
        allOf: [
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(dto) } },
              total: { type: 'number', example: 100 },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  offset: { type: 'number', example: 0 },
                  total: { type: 'number', example: 100 },
                },
              },
            },
          },
        ],
      },
      ...options,
    }),
  );
}
