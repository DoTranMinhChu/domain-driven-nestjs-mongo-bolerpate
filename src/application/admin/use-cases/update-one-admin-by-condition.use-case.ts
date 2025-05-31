import { AdminService } from '@domain/admin/services';
import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export class UpdateOneAdminByConditionUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(
    condition: FilterQuery<AdminSchema>,
    updateData: UpdateQuery<AdminSchema>,
  ) {
    return this.adminService.updateOneWithCondition(condition, updateData);
  }
}