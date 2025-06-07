import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfig } from '@infrastructure/mongoose/mongoose.config';
import { EnvironmentConfig } from '@infrastructure/environment/environment.config';
import { GraphqlModule } from '@presentation/graphql/graphql.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/filters';
import { AuthGuard, AccountTypesGuard } from '@shared/guards';
import { JwtModule } from '@nestjs/jwt';
import { ApiV1lModule } from '@presentation/api/v1/api-v1.module';
@Module({
  imports: [
    GraphqlModule,
    ApiV1lModule,
    JwtModule,
    EnvironmentConfig,
    MongooseConfig,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
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
export class AppModule {}
