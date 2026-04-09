import { Module } from '@nestjs/common';
import { HealthModule } from '@todos/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [HealthModule, McpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
