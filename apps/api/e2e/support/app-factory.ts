import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/**
 * Creates and initialises a fully-wired NestJS application for e2e tests.
 *
 * The app is bootstrapped with the same global prefix and validation pipe
 * used in production (`api/v1`) so that test requests match real endpoint
 * paths and the request-validation behaviour is identical.
 *
 * @returns A started INestApplication instance. Callers must call `app.close()` after use.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  await app.init();
  return app;
}
