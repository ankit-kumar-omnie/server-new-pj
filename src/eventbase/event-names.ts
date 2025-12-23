export const EventName = {
  UserCreated: 'user-created-event',
  UserUpdated: 'user-updated-event',
  NotificationCreated: 'notification-created-event',
  NotificationRead: 'notification-read-event',
  NotificationDeleted: 'notification-deleted-event',
} as const;

export type EventName = (typeof EventName)[keyof typeof EventName];
