import { Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';
import { EventSourcingService } from './event-sourcing.service';
import { EventSourcingController } from './event-sourcing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventData, EventSchema } from './event-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventData.name, schema: EventSchema }]),
  ],
  providers: [EventEmitterService, EventSourcingService],
  controllers: [EventSourcingController],
  exports: [EventEmitterService, EventSourcingService],
})
export class EventModule {}
