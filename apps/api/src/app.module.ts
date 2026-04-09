import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from '@todos/firebase';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [FirebaseModule, HealthModule, AuthModule, TodosModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
