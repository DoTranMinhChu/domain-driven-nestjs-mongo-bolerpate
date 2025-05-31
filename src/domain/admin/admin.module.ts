import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminSchema,
  AdminSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { AdminRepository } from '@infrastructure/mongoose/repositories';
import { AAdminRepository } from './repositories';
import { AdminService } from './services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminSchema.name, schema: AdminSchemaFactory },
    ]),
  ],
  providers: [
    { provide: AAdminRepository, useClass: AdminRepository },
    AdminService,
  ],
  exports: [AAdminRepository, AdminService],
})
export class DomainAdminModule {}
