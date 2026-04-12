import { Module } from '@nestjs/common';
import { ApiTokenStoreModule } from '@todos/store';
import { FirebaseAuthGuard } from './http/guards/firebase-auth.guard';

@Module({
  imports: [ApiTokenStoreModule],
  providers: [FirebaseAuthGuard],
  exports: [FirebaseAuthGuard],
})
export class SharedHttpModule {}
