# Spike: Inicializar TanStack Query en web y mobile

## Resultado del PoC

- Se agregó `@tanstack/react-query@5.99.0` en:
  - `apps/web`
  - `apps/mobile`
- Ambos targets inicializan `QueryClientProvider` en el root:
  - Web: `apps/web/src/main.tsx`
  - Mobile: `apps/mobile/src/app/_layout.tsx`
- Se migró la carga de `listTodos` a `useQuery` en:
  - Web: `apps/web/src/pages/Todos.tsx`
  - Mobile: `apps/mobile/src/hooks/useTodos.ts`
- Query keys de todos ahora usan identificador no sensible (`uid`) y parámetros de paginación (`page`, `limit`), sin usar `idToken`.
- Se agregó soporte de paginación en servicios `listTodos` (web/mobile) y estado de página en contenedores/hook UI.

## Recomendación de versión

- Recomendado: `@tanstack/react-query` v5 (`5.99.0` en este spike).
- Motivo: compatibilidad con React 19 y API estable para web + React Native.

## Policy default propuesta (compartida)

Implementada en:

- `apps/web/src/query/query-client.ts`
- `apps/mobile/src/query/query-client.ts`

Valores:

- `staleTime`: `30_000` ms
- `gcTime` (cacheTime en v4): `5 * 60_000` ms
- `retry`: máximo 3 intentos totales (1 inicial + 2 reintentos)
- `retryDelay`: backoff exponencial `1s, 2s, 4s` (cap a `30s`)
- `retryOn`: **no retry** cuando `status === 429`
- `refetchOnWindowFocus`: `false`
- `refetchOnReconnect`: `true`

## Testing (Vitest)

- Se añadieron ejemplos de retry/no-retry con `mock fetch`:
  - `apps/web/src/query/query-client.spec.ts`
  - `apps/mobile/src/query/query-client.spec.ts`
- Se ajustaron tests de integración para renderizar con `QueryClientProvider`:
  - `apps/web/src/pages/Todos.spec.tsx`
  - `apps/mobile/src/hooks/useTodos.spec.tsx`

## Impacto en CI / build / release

- CI:
  - Instalar nuevas dependencias (`yarn install`).
  - No requiere cambios en runners o workflow steps.
- Build:
  - Sin cambios de configuración de Vite o Expo para este PoC.
- Release / bundle:
  - Incremento de bundle por inclusión de React Query (evaluar en PR de producción con medición de tamaño por target).
  - Mantener imports desde `@tanstack/react-query` para favorecer tree-shaking.

## Riesgos operativos

- Si `refetchOnWindowFocus` se habilita en web sin control, puede aumentar tráfico y estados de carga.
- Retries agresivos pueden amplificar fallas de backend; por eso se limita a 3 intentos y se excluye 429.
- Si los errores HTTP no preservan `status`, las reglas de retry por código podrían no aplicarse.

## Backlog sugerido (PRs pequeños)

1. **PBI: Extraer configuración compartida real en paquete UI común**
   - Alcance: evitar duplicación `apps/web` y `apps/mobile`.
   - Estimación: **0.5 jornada**.
2. **PBI: Migrar creación de todos a `useMutation`**
   - Alcance: invalidación/optimistic updates consistentes.
   - Estimación: **0.5 jornada**.
3. **PBI: Definir estrategia SSR/hydration (solo web, si aplica)**
   - Alcance: `dehydrate/hydrate`, prefetch por ruta.
   - Estimación: **0.5-1 jornada**.
4. **PBI: Observabilidad de retries y errores 429/5xx**
   - Alcance: métricas y logging de query failures.
   - Estimación: **0.5 jornada**.
