export const EventName = {
  UserCreated: 'user-created-event',
  UserUpdated: 'user-updated-event',
} as const;

export type EventName = (typeof EventName)[keyof typeof EventName];
