import { DomainUserModule } from '@domain/user/user.module';

import {
  CreateUserUseCase,
  DeleteOneUserByConditionUseCase,
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  UpdateOneUserByConditionUseCase,
  UserLoginUseCase,
  UserRegistrationUseCase,
} from './use-cases';
import { Module } from '@nestjs/common';

@Module({
  imports: [DomainUserModule],
  providers: [
    FetchUserUseCase,
    GetOneUserByConditionUseCase,
    CreateUserUseCase,
    UpdateOneUserByConditionUseCase,
    DeleteOneUserByConditionUseCase,
    UserLoginUseCase,
    UserRegistrationUseCase,
  ],
  exports: [
    DomainUserModule,
    FetchUserUseCase,
    GetOneUserByConditionUseCase,
    CreateUserUseCase,
    UpdateOneUserByConditionUseCase,
    DeleteOneUserByConditionUseCase,
    UserLoginUseCase,
    UserRegistrationUseCase,
  ],
})
export class ApplicationUserModule {}
