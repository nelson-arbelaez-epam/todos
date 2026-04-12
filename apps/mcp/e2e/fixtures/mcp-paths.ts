/**
 * MCP e2e test fixture — base paths and shared constants.
 */

/** Root prefix applied to every API endpoint (mirrors apps/mcp/src/main.ts). */
export const API_PREFIX = '/api/v1';

/** Health-check endpoint path. */
export const HEALTH_PATH = `${API_PREFIX}/health`;

/** MCP endpoint path — POST-only Streamable HTTP transport (ADR 0020). */
export const MCP_PATH = '/mcp';
