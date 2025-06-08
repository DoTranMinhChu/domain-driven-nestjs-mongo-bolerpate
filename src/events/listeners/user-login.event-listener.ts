import { UserLoginEventPublisher } from '@events/publishers';
import { EVENT_KEY } from '@events/shares';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
@Injectable()
export class UserLoginEventListener {
  private readonly logger = new Logger(UserLoginEventListener.name);
  @OnEvent(EVENT_KEY.USER.LOGIN, { async: true })
  handleUserLogin(data: UserLoginEventPublisher) {
    this.logger.log(`Data Emitter:`, data);
  }
}
