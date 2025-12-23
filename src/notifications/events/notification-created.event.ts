import { EventName } from 'src/eventbase/event-names';

export interface NotificationCreatedPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
}

export const NotificationCreatedEventName = EventName.NotificationCreated;

export class NotificationCreatedEvent {
  constructor(public readonly payload: NotificationCreatedPayload) {}
}