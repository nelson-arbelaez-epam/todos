/**
 * Mobile e2e support — Maestro flow helper stub.
 *
 * This file acts as a placeholder for shared utilities used in Maestro YAML flows.
 *
 * Maestro flows are plain YAML files and do not import TypeScript modules directly.
 * This file documents the env vars expected by Maestro flows executed via
 * `maestro test apps/mobile/e2e/journeys/`.
 *
 * Required environment variables (set in CI or local `.env.e2e`):
 *   E2E_TEST_EMAIL    — email of the Firebase emulator test user
 *   E2E_TEST_PASSWORD — password of the Firebase emulator test user
 *   API_BASE_URL      — base URL of the Todos API (default: http://localhost:3000)
 *
 * Maestro installation (not yet performed — tracked in the follow-up PBI):
 *   curl -Ls "https://get.maestro.mobile.dev" | bash
 *
 * Run flows locally:
 *   maestro test apps/mobile/e2e/journeys/auth-login.yaml
 */

export {};
