import 'reflect-metadata';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { McpController } from './mcp.controller';
import { McpServerService } from './mcp-server.service';

interface MockTransport {
  close: ReturnType<typeof vi.fn>;
  handleRequest: ReturnType<typeof vi.fn>;
}

// Capture each transport instance created by the mock constructor
const createdTransports: MockTransport[] = [];

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => {
  const MockTransport = vi.fn(function (this: MockTransport) {
    this.close = vi.fn();
    this.handleRequest = vi.fn().mockResolvedValue(undefined);
    createdTransports.push(this);
  });
  return { StreamableHTTPServerTransport: MockTransport };
});

describe('McpController', () => {
  let controller: McpController;
  let mockClose: ReturnType<typeof vi.fn>;
  let mockConnect: ReturnType<typeof vi.fn>;
  let mockServer: {
    close: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
  };
  let mockMcpServerService: { createServer: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    createdTransports.length = 0;

    mockClose = vi.fn().mockResolvedValue(undefined);
    mockConnect = vi.fn().mockResolvedValue(undefined);
    mockServer = { close: mockClose, connect: mockConnect };
    mockMcpServerService = {
      createServer: vi.fn().mockReturnValue(mockServer),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpController],
      providers: [
        { provide: McpServerService, useValue: mockMcpServerService },
      ],
    }).compile();

    controller = module.get<McpController>(McpController);
  });

  describe('handle (POST /mcp)', () => {
    it('should create a server, connect transport, and handle the request', async () => {
      const mockReq = { body: { jsonrpc: '2.0', method: 'initialize', id: 1 } };
      const mockRes = {
        on: vi.fn(),
        headersSent: false,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handle(mockReq as never, mockRes as never);

      expect(mockMcpServerService.createServer).toHaveBeenCalledOnce();
      expect(mockConnect).toHaveBeenCalledOnce();
      expect(createdTransports).toHaveLength(1);
      expect(createdTransports[0].handleRequest).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        mockReq.body,
      );
    });

    it('should register a response close handler that cleans up transport and server', async () => {
      const listeners: Record<string, () => void> = {};
      const mockReq = { body: {} };
      const mockRes = {
        on: vi.fn((event: string, cb: () => void) => {
          listeners[event] = cb;
        }),
        headersSent: false,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handle(mockReq as never, mockRes as never);

      expect(mockRes.on).toHaveBeenCalledWith('close', expect.any(Function));

      // Simulate the response closing
      listeners.close?.();

      expect(createdTransports[0].close).toHaveBeenCalledOnce();
      expect(mockClose).toHaveBeenCalledOnce();
    });

    it('should return 500 JSON-RPC error when handler throws and headers not sent', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

      const mockReq = { body: {} };
      const mockRes = {
        on: vi.fn(),
        headersSent: false,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handle(mockReq as never, mockRes as never);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          error: expect.objectContaining({ code: -32603 }),
        }),
      );
    });

    it('should not write response if headers already sent when handler throws', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Late error'));

      const mockReq = { body: {} };
      const mockRes = {
        on: vi.fn(),
        headersSent: true,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handle(mockReq as never, mockRes as never);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('notAllowedGet (GET /mcp)', () => {
    it('should return 405 with method not allowed error', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      controller.notAllowedGet(mockRes as never);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: -32000 }),
        }),
      );
    });
  });

  describe('notAllowedDelete (DELETE /mcp)', () => {
    it('should return 405 with method not allowed error', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      controller.notAllowedDelete(mockRes as never);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: -32000 }),
        }),
      );
    });
  });
});
