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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchema.name, schema: UserSchemaFactory },
    ]),
  ],
  providers: [
    // đây là token (abstract) map xuống class thực thi
    { provide: AUserRepository, useClass: UserRepository },
    // những provider khác
    UserService,
    UserLoginService,
    AuthService,
  ],
  // EXPORT tất cả provider mà module ngoài có thể cần
  exports: [AUserRepository, UserService, UserLoginService, AuthService],
})
export class DomainUserModule {}
