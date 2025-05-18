import { EAccountType } from '@shared/enums';

export interface IAccessToken {
  id: string;
  type: EAccountType;
  [key: string]: any;
}
