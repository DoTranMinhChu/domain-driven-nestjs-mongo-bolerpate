// listeners/send-welcome-email.listener.ts
import { UserCreatedEventPublisher } from '@events/publishers';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserCreatedEventListener {
  private readonly logger = new Logger(UserCreatedEventListener.name);

  @OnEvent('user.created', { async: true })
  handleUserCreated(event: UserCreatedEventPublisher) {
    // chạy bất đồng bộ, không block flow chính
    this.logger.log(`Sending welcome email to `, event);
  }
}
