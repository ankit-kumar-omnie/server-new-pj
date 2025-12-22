import { SetMetadata } from '@nestjs/common';
import { Roles } from '../utils/roles.enum';

export const UserRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
