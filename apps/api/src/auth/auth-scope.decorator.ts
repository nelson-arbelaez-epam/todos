import { SetMetadata } from '@nestjs/common';
import type { ApiTokenScope } from '@todos/core';

/**
 * Metadata key used to declare required API token scopes on a route.
 */
export const AUTH_SCOPE_KEY = 'authScopes';

/**
 * Declares the API token scopes required to access a route or controller.
 *
 * For Firebase-authenticated requests this decorator is a no-op — existing
 * Firebase JWT flows are not scope-restricted by design (ADR 0022 §6).
 *
 * For API-token-authenticated requests, **all** listed scopes must be present
 * on the token; missing scopes result in `403 Forbidden`.
 *
 * @example
 * \@AuthScope('todos:read')
 * \@Get()
 * list() { ... }
 *
 * \@AuthScope('todos:write')
 * \@Post()
 * create() { ... }
 */
export const AuthScope = (...scopes: ApiTokenScope[]) =>
  SetMetadata(AUTH_SCOPE_KEY, scopes);
