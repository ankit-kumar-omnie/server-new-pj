import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationRepository } from '../repository/notification.repository';
import { EventEmitterService } from 'src/eventbase/event-emitter.service';
import { EventName } from 'src/eventbase/event-names';
import { NotificationCreatedPayload } from '../events/notification-created.event';
import { NotificationReadPayload } from '../events/notification-read.event';
import { NotificationDeletedPayload } from '../events/notification-deleted.event';
import {
  NotificationType,
  NotificationPriority,
} from '../schemas/notification.schema';
import { AuthPayload } from 'src/user/utils/auth.payload';
import { Roles } from 'src/user/utils/roles.enum';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  userId: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
}

@Injectable()
export class NotificationCommandService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const id = v4();

    const payload: NotificationCreatedPayload = {
      id,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.INFO,
      priority: dto.priority || NotificationPriority.MEDIUM,
      userId: dto.userId,
      metadata: dto.metadata,
      actionUrl: dto.actionUrl,
      expiresAt: dto.expiresAt,
    };

    this.eventEmitter.append(EventName.NotificationCreated, payload);

    return payload;
  }

  async markAsRead(notificationId: string, user: AuthPayload) {
    const userId = user?.id;
    const notification = await this.notificationRepository.findNotification({
      id: notificationId,
      ...(user?.role === Roles.CLIENT && { userId }),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.read) {
      return notification;
    }

    const payload: NotificationReadPayload = {
      id: notification.id,
      userId: notification?.userId,
      readAt: new Date(),
    };

    this.eventEmitter.append(EventName.NotificationRead, payload);

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(user: AuthPayload) {
    const userId = user?.id;
    const unreadNotifications =
      await this.notificationRepository.findNotifications({
        ...(user?.role === Roles.CLIENT && { userId }),
        read: false,
      });

    const readAt = new Date();

    for (const notification of unreadNotifications) {
      const payload: NotificationReadPayload = {
        id: notification.id,
        userId: notification?.userId,
        readAt,
      };

      this.eventEmitter.append(EventName.NotificationRead, payload);
    }

    return {
      message: 'All notifications marked as read',
      modifiedCount: unreadNotifications.length,
    };
  }

  async deleteNotification(notificationId: string, user: AuthPayload) {
    const userId = user?.id;
    const notification = await this.notificationRepository.findNotification({
      id: notificationId,
      ...(user?.role === Roles.CLIENT && { userId }),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const payload: NotificationDeletedPayload = {
      id: notification.id,
      userId: notification?.userId,
      deletedAt: new Date(),
    };

    this.eventEmitter.append(EventName.NotificationDeleted, payload);

    return { message: 'Notification deleted successfully' };
  }

  async createSystemNotification(
    title: string,
    message: string,
    userIds: string[],
    type: NotificationType = NotificationType.INFO,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
  ): Promise<NotificationCreatedPayload[]> {
    const notifications: NotificationCreatedPayload[] = [];

    for (const userId of userIds) {
      const notification = await this.createNotification({
        title,
        message,
        type,
        priority,
        userId,
        metadata: { isSystem: true },
      });
      notifications.push(notification);
    }

    return notifications;
  }
}
