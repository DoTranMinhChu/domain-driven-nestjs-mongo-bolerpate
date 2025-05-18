import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfig } from '@infrastructure/mongoose/mongoose.config';
import { EnvironmentConfig } from '@infrastructure/environment/environment.config';
import { GraphqlModule } from '@presentation/graphql/graphql.module';
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
    GraphqlModule,
    EnvironmentConfig,
    MongooseConfig,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
