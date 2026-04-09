import { Module } from '@nestjs/common';
import { TodosModule } from '../todos/todos.module';
import { McpController } from './mcp.controller';
import { McpServerService } from './mcp-server.service';

/**
 * NestJS module that wires the MCP SDK server and its HTTP transport controller.
 *
 * Imports {@link TodosModule} to gain access to {@link TodosApiService}, which
 * backs the `create_todo` MCP tool registered in {@link McpServerService}.
 *
 * See ADR 0020 for the architectural rationale.
 */
@Module({
  imports: [TodosModule],
  controllers: [McpController],
  providers: [McpServerService],
})
export class McpModule {}
