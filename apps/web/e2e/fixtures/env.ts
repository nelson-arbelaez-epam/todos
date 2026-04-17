/**
 * Web e2e fixtures — shared test data and environment configuration.
 *
 * These constants are used by all web e2e journey files.
 * They reference environment variables so CI can override values
 * without touching source code.
 */

/** Base URL of the web application under test. */
export const WEB_BASE_URL = process.env.WEB_BASE_URL ?? 'http://localhost:5173';

/** Base URL of the API backing the web app (used in journeys that need pre-seeded data). */
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

/** Test user credentials — only used in a dedicated Firebase emulator environment. */
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e-user@example.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'Test@1234',
};
