import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Define your decorator function
export const QueryGetList = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('request.body ==> ', request.body);
    return request.body.queryGetListInput; // Adjust according to your request structure
  },
);
