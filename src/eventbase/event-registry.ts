import { UserCreatedPayload } from 'src/user/events/user-created.event';
import { EventName } from './event-names';
import { UserUpdatedPayload } from 'src/user/events/user-updated.event';
import { NotificationCreatedPayload } from 'src/notifications/events/notification-created.event';
import { NotificationReadPayload } from 'src/notifications/events/notification-read.event';
import { NotificationDeletedPayload } from 'src/notifications/events/notification-deleted.event';

export interface EventPayloadMap {
  [EventName.UserCreated]: UserCreatedPayload;
  [EventName.UserUpdated]: UserUpdatedPayload;
  [EventName.NotificationCreated]: NotificationCreatedPayload;
  [EventName.NotificationRead]: NotificationReadPayload;
  [EventName.NotificationDeleted]: NotificationDeletedPayload;
}
