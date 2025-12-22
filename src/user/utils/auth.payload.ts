import { Roles } from './roles.enum';

export interface AuthPayload {
  role: Roles;
  id: string;
}
