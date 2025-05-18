import { SetMetadata } from '@nestjs/common';
import { EAccountType } from '@shared/enums';

export const ACCOUNT_TYPE = 'accountType';
export const AccountType = (accountTypes: EAccountType[]) =>
  SetMetadata(ACCOUNT_TYPE, accountTypes);
