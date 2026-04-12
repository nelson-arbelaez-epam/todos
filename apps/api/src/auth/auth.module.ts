import { Module } from '@nestjs/common';
import { AuthHttpModule } from './http/auth-http.module';

@Module({
  imports: [AuthHttpModule],
})
export class AuthModule {}
