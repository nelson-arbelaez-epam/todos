import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Create Todo DTO - for POST requests
 */
export class CreateTodoDto {
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
 * Update Todo DTO - for PUT/PATCH requests
 */
export class UpdateTodoDto {
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
 * Todo Response DTO - for HTTP responses
 */
export class TodoDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  completed!: boolean;

  @Type(() => Date)
  createdAt!: Date;

  @Type(() => Date)
  updatedAt!: Date;
}
