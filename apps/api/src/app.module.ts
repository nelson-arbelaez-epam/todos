import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from '@todos/firebase';
import { AuthModule } from './auth/auth.module';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { HealthModule } from './health/health.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [FirebaseModule, HealthModule, AuthModule, TodosModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
