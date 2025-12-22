import { EventName } from 'src/eventbase/event-names';

export interface UserUpdatedPayload {
  id: string;
  name?: string;
  email?: string;
  dob?: string;
  role?: string;
  password?: string;
}

export const UserUpdatedEventName = EventName.UserUpdated;

export class UserUpdatedEvent {
  constructor(public readonly payload: UserUpdatedPayload) {}
}
