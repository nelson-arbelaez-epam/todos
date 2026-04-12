import { createHash } from 'node:crypto';
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApiTokenScope } from '@todos/core';
import { FirebaseAuthService } from '@todos/firebase';
import { ApiTokenStoreService } from '@todos/store';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { AUTH_SCOPE_KEY } from './auth-scope.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Principal shape for requests authenticated with a long-lived API token (ADR 0022).
 */
export interface ApiTokenPrincipal {
  /** Firebase UID of the token owner */
  uid: string;
  /** Discriminator so downstream code can identify the auth provider */
  authProvider: 'api-token';
  /** Stable public token identifier */
  apiTokenId: string;
  /** Scopes granted to this token */
  scopes: ApiTokenScope[];
}

/**
 * Union of all possible authenticated user shapes on `request.user`.
 * - `DecodedIdToken` — Firebase JWT (existing path)
 * - `ApiTokenPrincipal` — long-lived API token (ADR 0022)
 */
export type AuthenticatedPrincipal = DecodedIdToken | ApiTokenPrincipal;

/**
 * Extends Express Request to carry the authenticated principal.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedPrincipal;
}

/** Prefix that identifies a long-lived API token (ADR 0022). */
const API_TOKEN_PREFIX = 'todos_';

/**
 * Guard that validates a Firebase JWT bearer token on every incoming request,
 * with ADR 0022 extension for `todos_`-prefixed long-lived API tokens.
 *
 * Routes decorated with `@Public()` bypass this guard entirely.
 * On success the principal is attached to `request.user`.
 *
 * Scope enforcement (`@AuthScope`):
 * - Firebase-authenticated requests: scope decorator is ignored.
 * - API-token-authenticated requests: all required scopes must be present
 *   on the token; missing scopes result in `403 Forbidden`.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly apiTokenStore: ApiTokenStoreService,
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

    if (token.startsWith(API_TOKEN_PREFIX)) {
      return this.validateApiToken(context, request, token);
    }

    return this.validateFirebaseToken(request, token);
  }

  // ---------------------------------------------------------------------------
  // Firebase JWT path (existing)
  // ---------------------------------------------------------------------------

  private async validateFirebaseToken(
    request: AuthenticatedRequest,
    token: string,
  ): Promise<boolean> {
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

  // ---------------------------------------------------------------------------
  // Long-lived API token path (ADR 0022)
  // ---------------------------------------------------------------------------

  private async validateApiToken(
    context: ExecutionContext,
    request: AuthenticatedRequest,
    rawToken: string,
  ): Promise<boolean> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const entity = await this.apiTokenStore.findByHash(tokenHash);

    if (!entity) {
      this.logger.warn('API token validation failed: token not found');
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (entity.revokedAt) {
      this.logger.warn(
        `API token validation failed: token revoked (tokenId=${entity.tokenId})`,
      );
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (entity.expiresAt && new Date(entity.expiresAt) < new Date()) {
      this.logger.warn(
        `API token validation failed: token expired (tokenId=${entity.tokenId})`,
      );
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    const principal: ApiTokenPrincipal = {
      uid: entity.ownerUid,
      authProvider: 'api-token',
      apiTokenId: entity.tokenId,
      scopes: entity.scopes,
    };
    request.user = principal;

    // Best-effort update of lastUsedAt — a write failure must not reject the request.
    this.apiTokenStore
      .updateLastUsedAt(entity.tokenId)
      .catch((err: unknown) => {
        this.logger.warn(
          `Failed to update lastUsedAt for tokenId=${entity.tokenId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      });

    this.enforceScopes(context, principal);

    return true;
  }

  // ---------------------------------------------------------------------------
  // @AuthScope enforcement (API-token requests only)
  // ---------------------------------------------------------------------------

  private enforceScopes(
    context: ExecutionContext,
    principal: ApiTokenPrincipal,
  ): void {
    const requiredScopes = this.reflector.getAllAndOverride<
      ApiTokenScope[] | undefined
    >(AUTH_SCOPE_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return;
    }

    const missingScope = requiredScopes.find(
      (scope) => !principal.scopes.includes(scope),
    );

    if (missingScope) {
      this.logger.warn(
        `API token missing required scope: ${missingScope} (tokenId=${principal.apiTokenId})`,
      );
      throw new ForbiddenException(
        `Insufficient scope: '${missingScope}' is required`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

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
