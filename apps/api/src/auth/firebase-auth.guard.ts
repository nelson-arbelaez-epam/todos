import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@todos/shared';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FirebaseAuthService } from '@todos/firebase';

/**
 * Extends Express Request to carry the decoded Firebase token as the
 * authenticated user identity.
 */
export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

/**
 * Guard that validates a Firebase JWT bearer token on every incoming request.
 *
 * Routes decorated with `@Public()` bypass this guard entirely.
 * On success the decoded token is attached to `request.user` so downstream
 * handlers can read the caller's uid and claims without re-verifying.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAuth: FirebaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (err: unknown) {
      this.logger.warn(
        `Token verification failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }
    return token;
  }
}
