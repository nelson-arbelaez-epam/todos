import { type DefaultOptions, QueryClient } from '@tanstack/react-query';

type RetryableError = {
  status?: number;
  response?: { status?: number };
};

const MAX_RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 1000;

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const retryableError = error as RetryableError;
  return retryableError.status ?? retryableError.response?.status;
}

export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  const status = getErrorStatus(error);
  if (status === 429) {
    return false;
  }

  return failureCount < MAX_RETRY_ATTEMPTS;
}

export function getRetryDelay(attemptIndex: number): number {
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** attemptIndex, 30_000);
}

export function getTodosQueryKey(idToken?: string) {
  return ['todos', idToken ?? null] as const;
}

export const queryClientDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: shouldRetryQuery,
    retryDelay: getRetryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
};

export function createTodosQueryClient() {
  return new QueryClient({
    defaultOptions: queryClientDefaultOptions,
  });
}
