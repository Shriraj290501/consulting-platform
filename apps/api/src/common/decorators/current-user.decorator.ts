import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IRequestUser } from '../../modules/auth/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (property: keyof IRequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: IRequestUser }>();
    const user = request.user;

    if (property) {
      return user[property];
    }

    return user;
  },
);
