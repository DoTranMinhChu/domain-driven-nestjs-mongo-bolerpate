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
import { UserModule } from '@domain/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '@domain/user/services/user.service';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [
    // AdminModule,
    UserModule,
    // UserBalanceTransactionModule,
    JwtModule,
    ConfigModule,
    EnvironmentConfig,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GraphqlAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GraphqlAccountTypesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountTypesGuard,
    },
    UserModule,
    GraphqlLoggingPlugin,
    UserResolver,
  ],
})
export class GraphqlModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    //   consumer
    //     .apply(QueryPrismaMiddleware)
    //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
