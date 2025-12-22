import { EventName } from 'src/eventbase/event-names';

export interface UserCreatedPayload {
  id: string;
  name: string;
  email: string;
  dob: string;
  role: string;
  password: string;
}

export const UserCreatedEventName = EventName.UserCreated;

export class UserCreatedEvent {
  constructor(public readonly payload: UserCreatedPayload) {}
}
