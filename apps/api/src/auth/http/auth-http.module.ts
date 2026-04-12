import { Module } from '@nestjs/common';
import { ApiTokenStoreModule } from '@todos/store';
import { ApiTokenService } from '../api-token.service';
import { AuthService } from '../auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [ApiTokenStoreModule],
  controllers: [AuthController],
  providers: [AuthService, ApiTokenService],
})
export class AuthHttpModule {}
