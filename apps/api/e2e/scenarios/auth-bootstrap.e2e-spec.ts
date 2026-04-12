import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AUTH_LOGIN_PATH, AUTH_TOKENS_PATH } from '../fixtures/api-paths';
import { createTestApp } from '../support/app-factory';

/**
 * Smoke e2e — auth bootstrap scenario.
 *
 * Validates that:
 * - The login endpoint is reachable and rejects unauthenticated / malformed requests.
 * - The token issuance endpoint (ADR 0022) is reachable and requires a valid Bearer token.
 *
 * These tests do NOT exercise the Firebase emulator path; they validate HTTP contract
 * shape (status codes and error formats) to ensure the API boots with auth routes wired.
 *
 * For full auth flows (login → issue token → use token → revoke), use the full e2e suite
 * against a Firebase emulator (see tools/e2e/env/docker-compose.e2e.yml).
 */
describe('Auth bootstrap (smoke e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 when the request body is missing', async () => {
      await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).expect(400);
    });

    it('returns 400 when required fields are absent', async () => {
      await request(app.getHttpServer())
        .post(AUTH_LOGIN_PATH)
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/tokens', () => {
    it('returns 401 when no Authorization header is provided', async () => {
      await request(app.getHttpServer())
        .post(AUTH_TOKENS_PATH)
        .send({ label: 'test-token', scopes: ['todos:read'] })
        .expect(401);
    });
  });
});
