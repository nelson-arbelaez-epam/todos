import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { MCP_PATH } from '../fixtures/mcp-paths';
import { createTestApp } from '../support/app-factory';

/**
 * Smoke e2e — MCP transport endpoint reachability.
 *
 * Validates that the Streamable HTTP transport endpoint (`POST /mcp`) is
 * reachable and returns a well-formed response even when no valid MCP
 * session exists (expected 4xx, not a 5xx crash).
 *
 * Full protocol-level flows (tool calls, resource reads) require a real
 * MCP SDK client and are handled in the full e2e suite.
 */
describe('MCP transport endpoint (smoke e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /mcp without a valid session → 4xx (not a server crash)', async () => {
    const res = await request(app.getHttpServer())
      .post(MCP_PATH)
      .set('Content-Type', 'application/json')
      .send({ jsonrpc: '2.0', method: 'initialize', params: {}, id: 1 });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
