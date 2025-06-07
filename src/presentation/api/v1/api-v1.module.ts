import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EnvironmentConfig } from '@infrastructure/environment/environment.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, AccountTypesGuard } from '@shared/guards';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { ApplicationUserModule } from '@application';
import { UserV1Controller } from './controllers';

@Module({
  imports: [ConfigModule, EnvironmentConfig, ApplicationUserModule],
  controllers: [UserV1Controller],
  providers: [],
})
export class ApiV1Module implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}
