import { SetMetadata } from '@nestjs/common';
import { EAccountType } from '@shared/enums';

export const GRAPHQL_ACCOUNT_TYPE = 'graphqlAccountType';
export const GraphqlAccountType = (accountTypes: EAccountType[]) =>
  SetMetadata(GRAPHQL_ACCOUNT_TYPE, accountTypes);
