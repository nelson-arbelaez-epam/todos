import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { AuthenticatedRequest } from './firebase-auth.guard';

/**
 * Parameter decorator that extracts the authenticated Firebase user from the
 * request context.  Must be used on routes protected by `FirebaseAuthGuard`.
 *
 * **Note**: On routes decorated with `@Public()`, the guard does not run and
 * `request.user` is `undefined`. Only use this decorator on protected routes.
 *
 * @example
 * \@Get('me')
 * getMe(@CurrentUser() user: DecodedIdToken) {
 *   return { uid: user.uid };
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
