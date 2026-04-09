import { Module } from '@nestjs/common';
import { TodosApiService } from './todos.service';

@Module({
  providers: [TodosApiService],
  exports: [TodosApiService],
})
export class TodosModule {}
