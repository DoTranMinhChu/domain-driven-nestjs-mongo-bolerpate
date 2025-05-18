import { AuthService } from '@domain/auth/services/auth.service';
import { UserRepository } from '@infrastructure/mongoose/repositories/user.repository';
import {
  UserSchema,
  UserSchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { UserResolver } from '@presentation/graphql/resolvers/user.resolver';
import { UserService } from './services/user.service';
import { UserLoginService } from './services/user-login.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchema.name, schema: UserSchemaFactory },
    ]),
  ],
  providers: [
    UserLoginService,
    AuthService,
    UserService,
    UserRepository,
    { provide: UserRepository.name, useClass: UserRepository },
  ],
  exports: [UserService, UserLoginService, UserRepository],
})
export class UserModule {}
