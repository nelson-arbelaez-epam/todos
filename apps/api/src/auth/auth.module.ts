import { Module } from '@nestjs/common';
import { ApiTokenService } from './api-token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, ApiTokenService],
  exports: [FirebaseAuthGuard],
})
export class AuthModule {}
