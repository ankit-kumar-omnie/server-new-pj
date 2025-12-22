import { Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './event-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventModule {}
