import { TODOS_FAVICON_SVG } from './todos-favicon-svg';

const TODOS_FAVICON_DATA_URI =
  `data:image/svg+xml;utf8,${encodeURIComponent(TODOS_FAVICON_SVG)}`;

/**
 * Returns a data URI for the shared Todos favicon SVG.
 */
export function getSharedFaviconDataUri(): string {
  return TODOS_FAVICON_DATA_URI;
}
