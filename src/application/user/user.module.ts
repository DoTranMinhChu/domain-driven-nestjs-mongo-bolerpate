import { DomainUserModule } from '@domain/user/user.module';
import { Module } from '@nestjs/common';
import { UserLoginUseCase } from './use-cases/user-login.use-case';
import { UserRegistrationUseCase } from './use-cases/user-registration.user-case';
import { FetchUsersUseCase } from './use-cases/fetch-users.use-case';
import {
  CreateUserUseCase,
  DeleteOneUserByConditionUseCase,
  GetOneUserByConditionUseCase,
  UpdateOneUserByConditionUseCase,
} from './use-cases';

@Module({
  imports: [DomainUserModule],
  providers: [
    FetchUsersUseCase,
    GetOneUserByConditionUseCase,
    CreateUserUseCase,
    UpdateOneUserByConditionUseCase,
    DeleteOneUserByConditionUseCase,
    UserLoginUseCase,
    UserRegistrationUseCase,
  ],
  exports: [
    DomainUserModule,
    FetchUsersUseCase,
    GetOneUserByConditionUseCase,
    CreateUserUseCase,
    UpdateOneUserByConditionUseCase,
    DeleteOneUserByConditionUseCase,
    UserLoginUseCase,
    UserRegistrationUseCase,
  ],
})
export class ApplicationUserModule {}
