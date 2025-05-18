import { DomainUserModule } from '@domain/user/user.module';
import { Module } from '@nestjs/common';
import { UserLoginUseCase } from './use-cases/user-logiin.use-case';

@Module({
  imports: [DomainUserModule],
  providers: [UserLoginUseCase],
  exports: [DomainUserModule, UserLoginUseCase],
})
export class ApplicationUserModule {}
