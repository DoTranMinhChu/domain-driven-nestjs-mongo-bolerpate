import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GRAPHQL_ACCOUNT_TYPE, RequesterDTO } from '@shared/decorators';
import { EAccountType } from '@shared/enums';

@Injectable()
export class GraphqlAccountTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const accountTypes: any = this.reflector.get<EAccountType>(
      GRAPHQL_ACCOUNT_TYPE,
      context.getHandler(),
    );
    if (!accountTypes) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);

    const requester = gqlContext.getContext().requester as RequesterDTO;

    return accountTypes.includes(requester.payload.type);
  }
}
