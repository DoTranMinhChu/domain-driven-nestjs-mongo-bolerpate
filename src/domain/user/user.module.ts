// src/domain/user/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSchema,
  UserSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { UserRepository } from '@infrastructure/mongoose/repositories/user.repository';
import { AUserRepository } from './repositories/user.repository.abstract';
import { UserService } from './services/user.service';
import { UserLoginService } from './services/user-login.service';
import { AuthService } from '@domain/auth/services/auth.service';
import { UserRegistrationService } from './services';
import { DomainAuthModule } from '@domain/auth/auth.module';

@Module({
  imports: [
    DomainAuthModule,
    MongooseModule.forFeature([
      { name: UserSchema.name, schema: UserSchemaFactory },
    ]),
  ],
  providers: [
    { provide: AUserRepository, useClass: UserRepository },
    UserService,
    UserLoginService,
    UserRegistrationService,
  ],
  exports: [
    AUserRepository,
    UserService,
    UserLoginService,
    UserRegistrationService,
  ],
})
export class DomainUserModule {}
