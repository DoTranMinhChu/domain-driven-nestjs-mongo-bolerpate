import { applyDecorators } from '@nestjs/common';
import { AuthApi } from '../auth';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ApiAuthRequired() {
  return applyDecorators(AuthApi(), ApiBearerAuth());
}
