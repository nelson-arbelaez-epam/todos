import { Module } from '@nestjs/common';
import { TodoStoreModule } from '@todos/store';
import { TodosService } from '../todos.service';
import { TodosController } from './todos.controller';

@Module({
  imports: [TodoStoreModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosHttpModule {}
