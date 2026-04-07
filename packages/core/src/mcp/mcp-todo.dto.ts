import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * MCP Todo DTO - for Model Context Protocol interactions
 * Designed to be serializable and compatible with MCP spec
 */
export class MCPTodoDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @Transform(({ value }) => value ?? false)
  completed!: boolean;

  @IsString()
  @IsDateString()
  createdAt!: string; // ISO 8601 string

  @IsString()
  @IsDateString()
  updatedAt!: string; // ISO 8601 string
}

/**
 * MCP Todo Create Request
 */
export class MCPCreateTodoRequest {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value ?? false)
  completed?: boolean;
}

/**
 * MCP Todo Update Request
 */
export class MCPUpdateTodoRequest {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

/**
 * MCP Todo List Response
 */
export class MCPTodoListResponse {
  @Type(() => MCPTodoDto)
  todos!: MCPTodoDto[];

  @Transform(({ value }) => Number(value))
  total!: number;

  @IsBoolean()
  hasMore!: boolean;
}

/**
 * MCP Todo Response
 */
export class MCPTodoResponse {
  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @Type(() => MCPTodoDto)
  data?: MCPTodoDto;

  @IsOptional()
  @IsString()
  error?: string;
}
