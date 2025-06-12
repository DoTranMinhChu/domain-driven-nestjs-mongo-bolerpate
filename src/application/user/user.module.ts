import { DomainUserModule } from '@domain/user/user.module';

import {
  CreateUserUseCase,
  DeleteOneUserByConditionUseCase,
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  UpdateOneUserByConditionUseCase,
  UserLoginUseCase,
  UserLoginWithGoogleUseCase,
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
    UserLoginWithGoogleUseCase,
  ],
  exports: [
    DomainUserModule,
    FetchUserUseCase,
    GetOneUserByConditionUseCase,
    CreateUserUseCase,
    UpdateOneUserByConditionUseCase,
    DeleteOneUserByConditionUseCase,
    UserLoginUseCase,
    UserLoginWithGoogleUseCase,
    UserRegistrationUseCase,
  ],
})
export class ApplicationUserModule {}
