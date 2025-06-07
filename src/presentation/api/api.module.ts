import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ApiV1Module } from './v1/api-v1.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ParseQueryPipe } from '@shared/pipes';
import { AccountTypesGuard, AuthGuard } from '@shared/guards';
import { JwtModule } from '@nestjs/jwt';
import { LoggingMiddleware } from '@shared/middlewares';

@Module({
  imports: [JwtModule, ApiV1Module],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountTypesGuard,
    },
    {
      useClass: ParseQueryPipe,
      provide: APP_PIPE,
    },
  ],
  exports: [ApiV1Module],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
