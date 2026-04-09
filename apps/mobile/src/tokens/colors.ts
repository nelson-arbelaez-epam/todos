/**
 * Design tokens – colours shared across the mobile app.
 * React Native does not support CSS custom properties; these constants
 * serve the same purpose as CSS :root tokens in the web app.
 */
export const colors = {
  primary: '#4F46E5',
  primaryDisabled: '#4F46E5',

  success: '#059669',

  error: '#EF4444',

  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#9CA3AF',

  backgroundScreen: '#F9FAFB',
  backgroundInput: '#fff',
  backgroundDisabledInput: '#F3F4F6',

  border: '#D1D5DB',

  white: '#fff',
} as const;
