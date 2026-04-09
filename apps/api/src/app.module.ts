import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from '@todos/firebase';
import { HealthModule } from '@todos/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { FirebaseAdminService } from './firebase/firebase-admin.service';

@Module({
  imports: [FirebaseModule, HealthModule, AuthModule],
  controllers: [AppController],
  providers: [
    FirebaseAdminService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
