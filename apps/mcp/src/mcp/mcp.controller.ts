import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpServerService } from './mcp-server.service';

/**
 * NestJS controller that exposes the MCP server over the Streamable HTTP transport.
 *
 * - `POST /mcp` – handles JSON-RPC 2.0 MCP requests (tool calls, initialize, etc.)
 * - `GET /mcp`  – 405 (SSE streaming not supported in stateless mode)
 * - `DELETE /mcp` – 405
 *
 * Each POST request runs in fully stateless mode: a new {@link McpServer} and
 * {@link StreamableHTTPServerTransport} are created per request and torn down when
 * the response stream closes. This avoids shared mutable state between requests.
 *
 * See ADR 0020 for the architectural rationale.
 */
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpServerService: McpServerService) {}

  /**
   * Handles MCP JSON-RPC requests via the Streamable HTTP transport.
   * Each invocation creates a fresh server + transport, processes the request,
   * then disposes both on response close.
   */
  @Post()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const headerValue = req.headers?.['x-api-key'];
    const apiToken = Array.isArray(headerValue)
      ? (headerValue[0] ?? '')
      : (headerValue ?? '');
    const server = this.mcpServerService.createServer(apiToken);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal error';
      this.logger.error(`MCP request failed: ${message}`);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  }

  /** SSE streaming is not supported in stateless mode; return 405. */
  @Get()
  notAllowedGet(@Res() res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
  }

  /** Session deletion is not applicable in stateless mode; return 405. */
  @Delete()
  notAllowedDelete(@Res() res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
  }
}
