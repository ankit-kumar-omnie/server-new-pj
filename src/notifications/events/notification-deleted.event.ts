import { EventName } from 'src/eventbase/event-names';

export interface NotificationDeletedPayload {
  id: string;
  userId: string;
  deletedAt: Date;
}

export const NotificationDeletedEventName = EventName.NotificationDeleted;

export class NotificationDeletedEvent {
  constructor(public readonly payload: NotificationDeletedPayload) {}
}