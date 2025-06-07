import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiParam } from '@nestjs/swagger';

export function ApiParamsInputSchema(schema: Type<unknown>) {
  // Reflect Swagger metadata for model properties
  const modelProps: any[] =
    Reflect.getMetadata('swagger/apiModelPropertiesArray', schema) || [];
  const params = modelProps.map((prop) =>
    ApiParam({
      name: prop.name,
      required: prop.required !== false,
      type: prop.typeFn ? prop.typeFn() : prop.type,
      description: prop.description,
    }),
  );
  return applyDecorators(ApiExtraModels(schema), ...params);
}
