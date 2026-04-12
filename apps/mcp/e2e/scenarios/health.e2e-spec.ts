import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { HEALTH_PATH } from '../fixtures/mcp-paths';
import { createTestApp } from '../support/app-factory';

/**
 * Smoke e2e — MCP health endpoint.
 *
 * Validates that the MCP server boots and the health endpoint responds
 * with HTTP 200 and the expected JSON body shape.
 *
 * This is the lightest possible e2e check for the MCP app — it runs on
 * every PR to catch bootstrap failures before heavier protocol scenarios.
 */
describe('MCP health endpoint (smoke e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health → 200 with status ok', async () => {
    await request(app.getHttpServer())
      .get(HEALTH_PATH)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ status: 'ok' });
        expect(typeof res.body.timestamp).toBe('string');
      });
  });
});
