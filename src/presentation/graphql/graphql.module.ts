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

import { UserResolver } from './resolvers/user.resolver';
import { ApplicationUserModule } from '@application/user/user.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      fieldResolverEnhancers: ['guards', 'filters', 'interceptors'],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ApplicationUserModule,
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
