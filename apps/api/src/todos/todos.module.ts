import { Module } from '@nestjs/common';
import { TodoStoreModule } from '@todos/store';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [FirebaseModule, TodoStoreModule],
  controllers: [TodosController],
  providers: [TodosService, FirebaseAuthGuard],
})
export class TodosModule {}
