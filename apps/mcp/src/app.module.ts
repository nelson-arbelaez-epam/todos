import { Module } from '@nestjs/common';
import { HealthModule } from '@todos/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [HealthModule, TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
