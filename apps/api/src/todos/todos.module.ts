import { Module } from '@nestjs/common';
import { TodoStoreModule } from '@todos/store';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [TodoStoreModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
