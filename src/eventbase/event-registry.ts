import { UserCreatedPayload } from 'src/user/events/user-created.event';
import { EventName } from './event-names';
import { UserUpdatedPayload } from 'src/user/events/user-updated.event';

export interface EventPayloadMap {
  [EventName.UserCreated]: UserCreatedPayload;
  [EventName.UserUpdated]: UserUpdatedPayload;
}
