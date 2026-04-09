/**
 * Shared auth types for the mobile app.
 */

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResult {
  uid: string;
  email: string;
}

export type RegisterError =
  | { kind: 'conflict'; message: string }
  | { kind: 'validation'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'unknown'; message: string };
