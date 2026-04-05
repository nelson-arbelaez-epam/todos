/**
 * Custom validation error that wraps class-validator errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
