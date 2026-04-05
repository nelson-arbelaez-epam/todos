import { Module } from '@nestjs/common';
import { TodoDtoTransformer } from '@todos/core';
import { FirebaseModule } from '@todos/firebase';
import { TodoStoreModule } from '@todos/store';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [FirebaseModule, TodoStoreModule],
  controllers: [TodosController],
  providers: [TodoDtoTransformer, TodosService],
})
export class TodosModule {}
