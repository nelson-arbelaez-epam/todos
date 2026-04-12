import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to mark routes as publicly accessible (no auth required).
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route handler or controller as publicly accessible,
 * bypassing any authentication guards that respect this metadata.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
