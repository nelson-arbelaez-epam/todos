import { Module } from '@nestjs/common';
import { ApiTokenStoreModule } from '@todos/store';
import { ApiTokenService } from './api-token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [ApiTokenStoreModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, ApiTokenService],
  exports: [FirebaseAuthGuard, ApiTokenStoreModule],
})
export class AuthModule {}
