import { Module } from '@nestjs/common';
import { ApiTokenStoreService } from './api-token-store.service';

@Module({
  providers: [ApiTokenStoreService],
  exports: [ApiTokenStoreService],
})
export class ApiTokenStoreModule {}
