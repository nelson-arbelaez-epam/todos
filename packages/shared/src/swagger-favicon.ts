import { readFileSync } from 'node:fs';

const TODOS_FAVICON_SVG = readFileSync(
  require.resolve('../assets/todos-favicon.svg', {
    paths: [__dirname],
  }),
  'utf8',
);

const TODOS_FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(TODOS_FAVICON_SVG)}`;

/**
 * Returns a data URI for the shared Todos favicon SVG.
 */
export function getSharedFaviconDataUri(): string {
  return TODOS_FAVICON_DATA_URI;
}
