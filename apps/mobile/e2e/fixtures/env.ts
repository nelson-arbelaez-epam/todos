/**
 * Mobile e2e fixtures — shared test data and environment configuration.
 *
 * These constants are used by all mobile e2e journey files.
 * They reference environment variables so CI can override values
 * without touching source code.
 */

/** Base URL of the API backing the mobile app (used in journeys that pre-seed data). */
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

/** Test user credentials — only used against a dedicated Firebase emulator environment. */
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e-user@example.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'Test@1234',
};
