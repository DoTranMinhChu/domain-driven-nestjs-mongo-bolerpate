import { MongooseBaseService } from '@infrastructure/mongoose';
import { AdminSchema } from '@infrastructure/mongoose/schemas';
import { Inject, Injectable } from '@nestjs/common';
import { AAdminRepository } from '../repositories/admin.repository.abstract';

@Injectable()
export class AdminService extends MongooseBaseService<AdminSchema> {
  constructor(
    @Inject(AAdminRepository)
    private readonly adminRepository: AAdminRepository,
  ) {
    super(adminRepository);
  }
}
