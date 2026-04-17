import { type ExecutionContext } from '@nestjs/common';
import { extractCurrentUser } from './current-user.decorator';

describe('CurrentUser decorator helper', () => {
  it('returns request.user when present', () => {
    const user = { uid: 'firebase-uid-123' };

    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as Partial<ExecutionContext>;

    const result = extractCurrentUser(ctx as ExecutionContext);

    expect(result).toBe(user);
  });

  it('returns undefined when request.user is not set', () => {
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as Partial<ExecutionContext>;

    const result = extractCurrentUser(ctx as ExecutionContext);

    expect(result).toBeUndefined();
  });
});
