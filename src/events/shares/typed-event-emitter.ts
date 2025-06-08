import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventMap } from './event-map';

@Injectable()
export class TypedEventEmitter {
  constructor(private readonly emitter: EventEmitter2) {}

  /**
   * Emit event với compile-time check:
   *  - key phải là một keyof EventMap
   *  - payload phải đúng type tương ứng
   */
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.emitter.emit(event as string, payload);
  }

  /** Nếu cần subscribe thủ công (bên cạnh @OnEvent) */
  on<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => any,
  ) {
    this.emitter.on(event as string, listener);
  }
}
