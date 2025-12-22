import { Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';

@Module({
  imports: [],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventModule {}
