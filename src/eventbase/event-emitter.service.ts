import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloadMap } from './event-registry';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventData } from './event-schema';

@Injectable()
export class EventEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(EventData.name) private eventModel: Model<EventData>,
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

  async readStreams<T extends { id: string }>(id: string): Promise<T> {
    const eventData = await this.eventModel.findOne({ id }).lean();

    if (!eventData?.events?.length) {
      throw new NotFoundException(`Events not found for aggregate ${id}`);
    }

    const aggregate = eventData.events.reduce<T>(
      (state, event) => ({
        ...state,
        ...this.removeNulls(event.payload),
      }),
      { id } as T,
    );

    return aggregate;
  }

  private removeNulls<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== null),
    ) as Partial<T>;
  }
}
