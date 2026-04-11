import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [HealthModule, McpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
