import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { EnvironmentConfig } from "@infrastructure/environment/environment.config";
import { ConfigModule } from "@nestjs/config";
import { ApplicationUserModule, ApplicationPostModule } from "@application";
import { UserV1Controller, PostV1Controller } from "./controllers";

@Module({
  imports: [
    ConfigModule,
    EnvironmentConfig,
    ApplicationUserModule,
    ApplicationPostModule,
  ],
  controllers: [UserV1Controller, PostV1Controller],
  providers: [],
})
export class ApiV1Module implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}
