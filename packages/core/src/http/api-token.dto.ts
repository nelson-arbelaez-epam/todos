import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

/**
 * Valid scope values for long-lived API tokens (ADR 0022).
 */
export const API_TOKEN_SCOPES = [
  'todos:read',
  'todos:write',
  'todos:delete',
] as const;

export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number];

/**
 * Request DTO for issuing a new long-lived API token.
 * POST /api/v1/auth/tokens
 */
export class CreateApiTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Human-readable label identifying the token (e.g. "MCP server – production")',
    example: 'MCP server – production',
  })
  label!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(API_TOKEN_SCOPES.length)
  @IsIn(API_TOKEN_SCOPES, { each: true })
  @ApiProperty({
    description: 'Permission scopes granted to this token',
    enum: API_TOKEN_SCOPES,
    isArray: true,
    example: ['todos:read', 'todos:write'],
  })
  scopes!: ApiTokenScope[];

  /**
   * Token lifetime in days (1–730).
   * - Omit the field entirely → defaults to 365 days.
   * - Pass `null` explicitly → token never expires (requires deliberate opt-in).
   * - Pass a number (1–730) → token expires after that many days.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(730)
  @Type(() => Number)
  @ApiPropertyOptional({
    description:
      'Token lifetime in days (1–730). Omit for the default (365 days). Pass null to issue a non-expiring token.',
    minimum: 1,
    maximum: 730,
    default: 365,
    nullable: true,
    example: 365,
  })
  expiresInDays?: number | null;
}

/**
 * Response DTO returned once at token issuance.
 * Contains the raw token value – this is the ONLY time the raw token is returned.
 * POST /api/v1/auth/tokens → 201
 */
export class ApiTokenResponseDto {
  @ApiProperty({
    description: 'Stable public identifier for this token (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  tokenId!: string;

  @ApiProperty({
    description:
      'Raw API token value. Store this securely – it will NOT be retrievable again.',
    example: 'todos_dGhpcyBpcyBhIHRlc3QgdG9rZW4gZm9yIHRlc3Q',
  })
  token!: string;

  @ApiProperty({
    description: 'Human-readable label for this token',
    example: 'MCP server – production',
  })
  label!: string;

  @ApiProperty({
    description: 'Permission scopes granted to this token',
    enum: API_TOKEN_SCOPES,
    isArray: true,
    example: ['todos:read', 'todos:write'],
  })
  scopes!: ApiTokenScope[];

  @ApiProperty({
    description: 'ISO timestamp when the token was created',
    example: '2026-04-11T13:00:00.000Z',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description:
      'ISO timestamp when the token expires, or null if it does not expire',
    example: '2027-04-11T13:00:00.000Z',
    nullable: true,
  })
  expiresAt!: string | null;
}

/**
 * Response DTO for token metadata (used in list and info responses).
 * Never includes the raw token value or its hash.
 * GET /api/v1/auth/tokens → 200
 */
export class ApiTokenMetadataDto {
  @ApiProperty({
    description: 'Stable public identifier for this token (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  tokenId!: string;

  @ApiProperty({
    description: 'Human-readable label for this token',
    example: 'MCP server – production',
  })
  label!: string;

  @ApiProperty({
    description: 'Permission scopes granted to this token',
    enum: API_TOKEN_SCOPES,
    isArray: true,
    example: ['todos:read', 'todos:write'],
  })
  scopes!: ApiTokenScope[];

  @ApiProperty({
    description: 'ISO timestamp when the token was created',
    example: '2026-04-11T13:00:00.000Z',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description:
      'ISO timestamp when the token expires, or null if it does not expire',
    example: '2027-04-11T13:00:00.000Z',
    nullable: true,
  })
  expiresAt!: string | null;

  @ApiPropertyOptional({
    description:
      'ISO timestamp when the token was last used for authentication, or null if never used',
    example: '2026-04-11T14:00:00.000Z',
    nullable: true,
  })
  lastUsedAt!: string | null;

  @ApiPropertyOptional({
    description:
      'ISO timestamp when the token was revoked, or null if still active',
    example: null,
    nullable: true,
  })
  revokedAt!: string | null;
}

/**
 * Response DTO returned after successfully revoking a token.
 * DELETE /api/v1/auth/tokens/:tokenId → 200
 */
export class RevokeApiTokenResponseDto {
  @ApiProperty({
    description: 'Identifier of the revoked token',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  tokenId!: string;

  @ApiProperty({
    description: 'ISO timestamp when the token was revoked',
    example: '2026-04-11T15:00:00.000Z',
  })
  revokedAt!: string;
}
