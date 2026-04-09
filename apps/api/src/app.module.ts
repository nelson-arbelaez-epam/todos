import { Module } from '@nestjs/common';
import { FirebaseModule as FirebaseInfraModule } from '@todos/firebase';
import { HealthModule } from '@todos/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [HealthModule, FirebaseInfraModule, AuthModule, TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
