import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EnvironmentConfig } from '@infrastructure/environment/environment.config';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthGuard,
  GraphqlAuthGuard,
  GraphqlAccountTypesGuard,
  AccountTypesGuard,
} from '@shared/guards';
import { GraphqlLoggingPlugin } from '@shared/plugins';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import {
  ApplicationPostModule,
  ApplicationUserModule,
  ApplicationAdminModule,
} from '@application';
import { UserV1Controller } from './controllers';

@Module({
  imports: [JwtModule, ConfigModule, EnvironmentConfig, ApplicationUserModule],
  controllers: [UserV1Controller],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: AccountTypesGuard,
    },
  ],
})
export class ApiV1lModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    //   consumer
    //     .apply(QueryPrismaMiddleware)
    //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
