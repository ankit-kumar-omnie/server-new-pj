import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayload } from '../utils/auth.payload';

export const UserContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
