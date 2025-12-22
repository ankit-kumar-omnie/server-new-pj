import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventName } from './event-names';

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ type: [Object], default: [] })
  events: EventRecord[];
}

export interface EventRecord {
  eventName: EventName;
  payload: any;
  createdAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
