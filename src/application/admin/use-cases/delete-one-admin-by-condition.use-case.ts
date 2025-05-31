import { AdminService } from '@domain/admin/services';
import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class DeleteOneAdminByConditionUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(condition: FilterQuery<AdminSchema>) {
    return this.adminService.softDeleteByCondition(condition);
  }
}