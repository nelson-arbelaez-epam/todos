import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from '@todos/firebase';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { FirebaseAuthGuard } from './shared/http/guards/firebase-auth.guard';
import { SharedHttpModule } from './shared/shared-http.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    FirebaseModule,
    HealthModule,
    AuthModule,
    TodosModule,
    SharedHttpModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useExisting: FirebaseAuthGuard }],
})
export class AppModule {}
