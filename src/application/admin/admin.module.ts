import { DomainAdminModule } from '@domain/admin/admin.module';
import {
  CreateAdminUseCase,
  DeleteOneAdminByConditionUseCase,
  FetchAdminUseCase,
  GetOneAdminByConditionUseCase,
  UpdateOneAdminByConditionUseCase,
} from '@application/admin/use-cases';
import { Module } from '@nestjs/common';

@Module({
  imports: [DomainAdminModule],
  providers: [
    FetchAdminUseCase,
    GetOneAdminByConditionUseCase,
    CreateAdminUseCase,
    UpdateOneAdminByConditionUseCase,
    DeleteOneAdminByConditionUseCase,
  ],
  exports: [
    DomainAdminModule,
    FetchAdminUseCase,
    GetOneAdminByConditionUseCase,
    CreateAdminUseCase,
    UpdateOneAdminByConditionUseCase,
    DeleteOneAdminByConditionUseCase,
  ],
})
export class ApplicationAdminModule {}