import { Module } from '@nestjs/common';
import { TodoDtoTransformer } from '@todos/dtos';
import { firebaseAdminProviders } from '../firebase/firebase-admin.providers';
import { FirestoreTodoRepository } from './firestore-todo.repository';
import { TODO_REPOSITORY } from './todo-repository';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  controllers: [TodosController],
  providers: [
    ...firebaseAdminProviders,
    TodoDtoTransformer,
    TodosService,
    {
      provide: TODO_REPOSITORY,
      useClass: FirestoreTodoRepository,
    },
  ],
})
export class TodosModule {}
