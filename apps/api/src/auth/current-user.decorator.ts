import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedPrincipal, AuthenticatedRequest } from './firebase-auth.guard';

/**
 * Parameter decorator that extracts the authenticated principal from the
 * request context.  Must be used on routes protected by `FirebaseAuthGuard`.
 *
 * The returned value is either a Firebase `DecodedIdToken` (for Firebase JWT
 * authentication) or an `ApiTokenPrincipal` (for long-lived API token
 * authentication). Both shapes expose a `uid` field that identifies the user.
 *
 * **Note**: On routes decorated with `@Public()`, the guard does not run and
 * `request.user` is `undefined`. Only use this decorator on protected routes.
 *
 * @example
 * \@Get('me')
 * getMe(@CurrentUser() user: AuthenticatedPrincipal) {
 *   return { uid: user.uid };
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedPrincipal => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
