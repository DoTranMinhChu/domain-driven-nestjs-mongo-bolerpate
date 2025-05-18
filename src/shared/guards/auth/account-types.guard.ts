import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCOUNT_TYPE, RequesterDTO } from '@shared/decorators';
import { EAccountType } from '@shared/enums';

@Injectable()
export class AccountTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const accountTypes: any = this.reflector.get<EAccountType>(
      ACCOUNT_TYPE,
      context.getHandler(),
    );

    if (!accountTypes) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const requester = request.requester as RequesterDTO;
    return accountTypes.includes(requester.payload.type);
  }
}
