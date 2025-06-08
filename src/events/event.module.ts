import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApplicationUserModule } from '@application';
import { UserCreatedEventListener } from './listeners';
import { EventEmitterModule } from '@nestjs/event-emitter/dist';
import { TypedEventEmitter } from './shares';
import { UserLoginEventListener } from './listeners/user-login.event-listener';
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: true,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    HttpModule,
    ApplicationUserModule,
  ],
  providers: [
    TypedEventEmitter,
    UserCreatedEventListener,
    UserLoginEventListener,
  ],
  exports: [TypedEventEmitter],
})
export class EventModule {}
