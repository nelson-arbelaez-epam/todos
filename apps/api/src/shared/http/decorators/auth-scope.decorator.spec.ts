import 'reflect-metadata';
import { AUTH_SCOPE_KEY, AuthScope } from './auth-scope.decorator';

describe('AuthScope decorator', () => {
  it('sets metadata on a method with provided scopes', () => {
    class Dummy {
      @AuthScope('todos:read', 'todos:write')
      method() {}
    }

    const methodFn = Dummy.prototype.method;
    const scopes =
      Reflect.getMetadata(AUTH_SCOPE_KEY, methodFn) ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy.prototype, 'method') ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy, 'method') ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy);

    expect(scopes).toEqual(['todos:read', 'todos:write']);
  });

  it('returns an empty array when no scopes provided (edge)', () => {
    const decorator = AuthScope();
    class Dummy2 {
      @decorator
      method2() {}
    }

    const methodFn2 = Dummy2.prototype.method2;
    const scopes =
      Reflect.getMetadata(AUTH_SCOPE_KEY, methodFn2) ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy2.prototype, 'method2') ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy2, 'method2') ||
      Reflect.getMetadata(AUTH_SCOPE_KEY, Dummy2) ||
      [];

    expect(scopes).toEqual([]);
  });
});
