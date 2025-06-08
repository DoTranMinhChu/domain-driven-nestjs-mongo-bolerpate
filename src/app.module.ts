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
import { ApiModule } from '@presentation/api/api.module';
import { EventModule } from '@events/event.module';

@Module({
  imports: [
    EventModule,
    GraphqlModule,
    ApiModule,
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
  exports: [EventModule],
})
export class AppModule {}
