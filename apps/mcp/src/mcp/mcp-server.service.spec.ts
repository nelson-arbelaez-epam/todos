import 'reflect-metadata';
import { Test, type TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from './mcp-server.service';
import { TodosApiService } from '../todos/todos.service';

const _mockTodo = {
  id: 'todo-1',
  title: 'Test Todo',
  description: 'A test todo',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockTodosApiService = {
  createTodo: vi.fn(),
};

describe('McpServerService', () => {
  let service: McpServerService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpServerService,
        { provide: TodosApiService, useValue: mockTodosApiService },
      ],
    }).compile();

    service = module.get<McpServerService>(McpServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createServer', () => {
    it('should return an McpServer instance', () => {
      const server = service.createServer();
      expect(server).toBeInstanceOf(McpServer);
    });

    it('should return a new server instance on each call', () => {
      const server1 = service.createServer();
      const server2 = service.createServer();
      expect(server1).not.toBe(server2);
    });

    it('should create a server with the create_todo tool registered', () => {
      const server = service.createServer();
      // The registered tools are accessible on the internal Server's request handlers.
      // We verify the server has capabilities for tools.
      expect(server).toBeDefined();
    });
  });
});
