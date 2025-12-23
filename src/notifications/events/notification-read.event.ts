import { EventName } from 'src/eventbase/event-names';

export interface NotificationReadPayload {
  id: string;
  userId: string;
  readAt: Date;
}

export const NotificationReadEventName = EventName.NotificationRead;

export class NotificationReadEvent {
  constructor(public readonly payload: NotificationReadPayload) {}
}