import 'reflect-metadata';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return status ok with an ISO timestamp', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('should be marked as public', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, HealthController);

    expect(isPublic).toBe(true);
  });
});
