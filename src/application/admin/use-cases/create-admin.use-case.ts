import { AdminService } from '@domain/admin/services';
import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateAdminUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(createData: Partial<AdminSchema>) {
    return this.adminService.create(createData);
  }
}