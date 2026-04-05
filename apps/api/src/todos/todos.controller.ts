import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core';
import { TodosService } from './todos.service';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(
    @Query('includeArchived') includeArchived?: string,
  ): Promise<TodoDto[]> {
    return this.todosService.findAll(includeArchived === 'true');
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<TodoDto> {
    return this.todosService.findById(id);
  }

  @Post()
  create(@Body() payload: CreateTodoDto): Promise<TodoDto> {
    return this.todosService.create(payload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateTodoDto,
  ): Promise<TodoDto> {
    return this.todosService.update(id, payload);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string): Promise<TodoDto> {
    return this.todosService.archive(id);
  }
}
