// listeners/send-welcome-email.listener.ts
import { UserLoginEventPublisher } from '@events/publishers';
import { EVENT_KEY } from '@events/shares';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserLoginEventListener {
  private readonly logger = new Logger(UserLoginEventListener.name);

  @OnEvent(EVENT_KEY.USER.LOGIN, { async: true })
  handleUserLogin(event: UserLoginEventPublisher) {
    // chạy bất đồng bộ, không block flow chính
    this.logger.log(`User logged in: ${event.userSchema.name}`);
  }
}
