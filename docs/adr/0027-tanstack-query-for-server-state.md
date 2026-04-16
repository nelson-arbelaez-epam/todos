# ADR 0027 - TanStack Query for Server-State Management in UI Apps

- Status: Accepted
- Date: 2026-04-15
- Related: ADR 0021 (UI architecture); ADR 0024 (session state management); Spike "Inicializar TanStack Query en web y mobile para `listTodos`"

## Context

Both `apps/web` and `apps/mobile` need to fetch, cache, and synchronise todo data from the
REST API. Before this ADR, each component fetched data via manual `useState` + `useEffect`
hooks with no shared caching strategy. This led to:

- Repeated network requests on every mount with no deduplication.
- Manual loading/error/stale-data tracking in each hook.
- Ad-hoc cache invalidation after create/update mutations.
- No pagination support for large todo lists.

[ADR 0024](0024-session-state-management-for-ui-session-context.md) established that
**Zustand** owns local auth/session lifecycle state. Server-state (remote data from the API)
is a separate concern that benefits from a dedicated library with request deduplication,
stale-while-revalidate semantics, and mutation lifecycle management.

## Decision

Adopt **TanStack Query (`@tanstack/react-query`)** as the standard library for all
server-state data fetching and mutation in `apps/web` and `apps/mobile`.

### Query keys

All query keys are defined in a single `src/query/query-client.ts` module per app
and exported via a typed `getTodosQueryKey(uid, page, limit)` factory.

- **Use the authenticated user `uid` as the stable user identifier in cache keys** — never
  the `idToken` (JWT), which is a sensitive credential and rotates.
- Include pagination parameters (`page`, `limit`) in the key so pages are cached
  independently and switching pages does not evict the previous page.

```ts
// Example query key shape
['todos', uid, page, limit]
```

### `useQuery` for read operations

```ts
const { data, isLoading, error, refetch } = useQuery({
  queryKey: getTodosQueryKey(currentUser?.uid, page, PAGE_LIMIT),
  queryFn: () => listTodos(currentUser?.idToken, { page, limit: PAGE_LIMIT }),
});
```

### `useMutation` for write operations (create, update, delete)

**All create and update operations must use `useMutation`**, not manual `useState`-based
loading/error tracking. This provides a consistent API surface, lifecycle callbacks
(`onSuccess`, `onMutate`, `onSettled`, `onError`), and automatic error exposure via
`mutation.error`.

```ts
const createMutation = useMutation<TodoDto, Error, CreateTodoDto>({
  mutationFn: (payload) => createTodo(payload, currentUser?.idToken),
  onSuccess: (created) => {
    queryClient.setQueryData(getTodosQueryKey(...), (prev) => ...);
  },
});
```

After a successful mutation, **update the query cache directly** via
`queryClient.setQueryData` rather than triggering a full refetch. This provides
optimistic-like UX without the complexity of a full optimistic update rollback.

### Pagination

The `listTodos` service accepts `{ page, limit }` parameters and the API returns a
`TodoListDto` (`{ items, total, page, limit }`). Hooks expose:
`page`, `totalPages`, `canGoToPreviousPage`, `canGoToNextPage`, `nextPage()`,
`previousPage()`.

### QueryClient configuration

A shared `createQueryClient()` factory (per app) configures:

- `retry: 1` on queries (to avoid hammering a failing API on mount).
- `staleTime: 30_000` (30 s) so page switches feel instant.
- `gcTime: 5 * 60_000` (5 min) to keep unused cached pages in memory briefly.

### Scope boundary

TanStack Query manages **remote server state** only. Local UI state (auth session,
form state, optimistic selection) stays in Zustand or `useState` as appropriate per
ADR 0024 and ADR 0026.

## Consequences

### Positive

- Request deduplication: multiple components mounting simultaneously do not multiply
  network calls.
- Automatic stale/refetch on window focus and reconnect without manual `useEffect`.
- Per-operation error tracking via `mutation.error` without `useState` boilerplate.
- Pagination with independent page caches.
- Consistent patterns across `apps/web` and `apps/mobile`.

### Negative / Trade-offs

- Bundle size: `@tanstack/react-query` adds ~13 kB (gzip) to each app.
- Wrapping the app in `QueryClientProvider` is required (added to each app root).
- Per-item concurrent-update blocking (e.g., preventing two updates to the same todo
  item) must still be handled manually via a `useRef` guard since `useMutation` does
  not natively deduplicate mutations by an arbitrary key.

## Alternatives Considered

| Option | Reason rejected |
|--------|-----------------|
| SWR | Smaller API, no built-in mutation lifecycle or cache manipulation. |
| Redux Toolkit Query (RTK Query) | Requires Redux, which ADR 0024 reserves for ADR-approved exceptions. |
| Manual `useState` + `useEffect` | Already in use; does not scale — repeated network calls, no deduplication, verbose error/loading boilerplate. |
| Zustand for server state | ADR 0024 scopes Zustand to local session/auth state. Mixing server data blurs that boundary. |
