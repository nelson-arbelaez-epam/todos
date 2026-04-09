import { Module } from '@nestjs/common';
import { HealthModule } from '@todos/shared';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [HealthModule, McpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
