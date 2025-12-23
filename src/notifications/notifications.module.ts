import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationCommandService } from './service/notification-command.service';
import { NotificationQueryService } from './service/notification-query.service';
import { NotificationCommandController } from './controller/notification-command.controller';
import { NotificationQueryController } from './controller/notification-query.controller';
import { NotificationHandler } from './handlers/notification.handler';
import { NotificationRepository } from './repository/notification.repository';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { EventModule } from '../eventbase/event.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EventModule,
    JwtModule,
    UserModule
  ],
  controllers: [NotificationCommandController, NotificationQueryController],
  providers: [
    NotificationCommandService,
    NotificationQueryService,
    NotificationHandler,
    NotificationRepository,
  ],
  exports: [
    NotificationCommandService,
    NotificationQueryService,
    NotificationRepository,
  ],
})
export class NotificationsModule {}
