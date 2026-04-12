import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/**
 * Creates and initialises a fully-wired NestJS MCP application for e2e tests.
 *
 * The app is bootstrapped with the same global prefix used in production (`api/v1`)
 * so that test requests match real endpoint paths.
 *
 * @returns A started INestApplication instance. Callers must call `app.close()` after use.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}
