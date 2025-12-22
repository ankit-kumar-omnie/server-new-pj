import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloadMap } from './event-registry';

@Injectable()
export class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  append<E extends keyof EventPayloadMap>(
    eventName: E,
    payload: EventPayloadMap[E],
  ): void {
    this.eventEmitter.emit(eventName, payload);
  }
}
