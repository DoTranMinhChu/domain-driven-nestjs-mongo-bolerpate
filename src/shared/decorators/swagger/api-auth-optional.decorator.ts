import { applyDecorators } from '@nestjs/common';
import { AuthOrUnauthApi } from '../auth';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthOptional() {
  return applyDecorators(
    AuthOrUnauthApi(),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
  );
}
