import { AdminService } from '@domain/admin/services';
import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { IQueryGetListInputType } from '@shared/interfaces';

@Injectable()
export class FetchAdminUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(queryInput: IQueryGetListInputType<AdminSchema>) {
    return this.adminService.fetch(queryInput);
  }
}