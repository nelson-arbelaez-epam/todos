/**
 * API smoke e2e test fixture — base URLs and shared constants.
 *
 * These values are used across all API e2e scenario files so that changes
 * to the global prefix or port only need to happen in one place.
 */

/** Root prefix applied to every API endpoint (mirrors apps/api/src/main.ts). */
export const API_PREFIX = '/api/v1';

/** Health-check endpoint path. */
export const HEALTH_PATH = `${API_PREFIX}/health`;

/** Auth endpoints. */
export const AUTH_LOGIN_PATH = `${API_PREFIX}/auth/login`;
export const AUTH_TOKENS_PATH = `${API_PREFIX}/auth/tokens`;
