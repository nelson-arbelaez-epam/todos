import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosApiService } from './todos.service';

@Module({
  controllers: [TodosController],
  providers: [TodosApiService],
})
export class TodosModule {}
