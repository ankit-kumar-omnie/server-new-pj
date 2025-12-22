import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloadMap } from './event-registry';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EventEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async append<E extends keyof EventPayloadMap>(
    eventName: E,
    payload: EventPayloadMap[E],
  ): Promise<void> {
    await this.eventModel.updateOne(
      { id: payload.id },
      {
        $push: {
          events: {
            eventName,
            payload,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true },
    );

    this.eventEmitter.emit(eventName, payload);
  }
}
