import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../schemas/notification.schema';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/eventbase/event-names';
import type { NotificationCreatedPayload } from '../events/notification-created.event';
import type { NotificationReadPayload } from '../events/notification-read.event';
import type { NotificationDeletedPayload } from '../events/notification-deleted.event';
import type { UserCreatedPayload } from 'src/user/events/user-created.event';
import type { UserUpdatedPayload } from 'src/user/events/user-updated.event';
import { NotificationCommandService } from '../service/notification-command.service';
import { NotificationType, NotificationPriority } from '../schemas/notification.schema';

@Injectable()
export class NotificationHandler {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly notificationCommandService: NotificationCommandService,
  ) {}

  @OnEvent(EventName.NotificationCreated)
  async handleCreateNotification(payload: NotificationCreatedPayload) {
    await this.notificationModel.create({
      ...payload,
      read: false,
      createdAt: new Date(),
    });
  }

  @OnEvent(EventName.NotificationRead)
  async handleReadNotification(payload: NotificationReadPayload) {
    await this.notificationModel.updateOne(
      { id: payload.id, userId: payload.userId },
      {
        $set: {
          read: true,
          readAt: payload.readAt,
        },
      },
    );
  }

  @OnEvent(EventName.NotificationDeleted)
  async handleDeleteNotification(payload: NotificationDeletedPayload) {
    await this.notificationModel.deleteOne({
      id: payload.id,
      userId: payload.userId,
    });
  }

  // Listen to UserCreated event and create welcome notification
  @OnEvent(EventName.UserCreated)
  async handleUserCreated(payload: UserCreatedPayload) {
    await this.notificationCommandService.createNotification({
      title: '🎉 Welcome to Event Dashboard!',
      message: `Hi ${payload.name}! Your account has been successfully created. Welcome to our event sourcing platform!`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      userId: payload.id,
      metadata: {
        eventType: 'user_created',
        userRole: payload.role,
        isWelcome: true
      },
      actionUrl: '/dashboard'
    });
  }

  // Listen to UserUpdated event and create update notification
  @OnEvent(EventName.UserUpdated)
  async handleUserUpdated(payload: UserUpdatedPayload) {
    await this.notificationCommandService.createNotification({
      title: '✅ Profile Updated',
      message: 'Your profile has been successfully updated. Changes are now active.',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      userId: payload.id,
      metadata: {
        eventType: 'user_updated',
        updatedFields: Object.keys(payload).filter(key => key !== 'id')
      },
      actionUrl: '/settings'
    });
  }
}
