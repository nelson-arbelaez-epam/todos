import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('May be created without throwing', async () => {
    await expect(
      Test.createTestingModule({ imports: [AppModule] }).compile(),
    ).resolves.not.toThrow();
  });
});
