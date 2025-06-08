import {
  UserCreatedEventPublisher,
  UserLoginEventPublisher,
} from '@events/publishers';
import { EVENT_KEY } from './event-key';

export interface EventMap {
  [EVENT_KEY.USER.CREATED]: UserCreatedEventPublisher;
  [EVENT_KEY.USER.LOGIN]: UserLoginEventPublisher;
}
