import { Module } from '@nestjs/common';
import { TodoStoreService } from './todo-store.service';

@Module({
  providers: [TodoStoreService],
  exports: [TodoStoreService],
})
export class TodoStoreModule {}
