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
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PostResolver, UserResolver, AdminResolver } from './resolvers';
import {
  ApplicationPostModule,
  ApplicationUserModule,
  ApplicationAdminModule,
} from '@application';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      fieldResolverEnhancers: ['guards', 'filters', 'interceptors'],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/graphql',
    }),
    JwtModule,
    ConfigModule,
    EnvironmentConfig,
    ApplicationPostModule,
    ApplicationUserModule,
    ApplicationAdminModule,
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
    PostResolver,
    UserResolver,
    AdminResolver,
  ],
})
export class GraphqlModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    //   consumer
    //     .apply(QueryPrismaMiddleware)
    //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
