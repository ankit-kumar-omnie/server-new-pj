import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './eventbase/event.module';
import { HealthModule } from './health/health.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    EventEmitterModule.forRoot(),
    EventModule,
    UserModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
