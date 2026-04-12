import { Module } from '@nestjs/common';
import { TodosHttpModule } from './http/todos-http.module';

@Module({
  imports: [TodosHttpModule],
})
export class TodosModule {}
