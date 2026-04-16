import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
import EditTodoForm from './EditTodoForm';

const mockTodo: TodoDto = {
  id: 'todo-1',
  title: 'Original title',
  description: 'Original description',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EditTodoForm', () => {
  it('pre-fills title and description from the todo', () => {
    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const titleInput = screen.getByTestId(
      `form-field--editTodoTitle-${mockTodo.id}`,
    ) as HTMLInputElement;
    const descInput = screen.getByTestId(
      `form-field--editTodoDescription-${mockTodo.id}`,
    ) as HTMLInputElement;

    expect(titleInput.value).toBe('Original title');
    expect(descInput.value).toBe('Original description');
  });

  it('calls onSubmit with trimmed values when title is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const titleInput = screen.getByTestId(
      `form-field--editTodoTitle-${mockTodo.id}`,
    );
    await user.clear(titleInput);
    await user.type(titleInput, '  Updated title  ');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(mockTodo.id, {
      title: 'Updated title',
      description: 'Original description',
    });
  });

  it('shows validation error and blocks submit when title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const titleInput = screen.getByTestId(
      `form-field--editTodoTitle-${mockTodo.id}`,
    );
    await user.clear(titleInput);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the updateError from props', () => {
    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={false}
        updateError="Server error occurred"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Server error occurred',
    );
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={false}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables inputs and buttons while isUpdating is true', () => {
    render(
      <EditTodoForm
        todo={mockTodo}
        isUpdating={true}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId(`form-field--editTodoTitle-${mockTodo.id}`),
    ).toBeDisabled();
    expect(
      screen.getByTestId(`form-field--editTodoDescription-${mockTodo.id}`),
    ).toBeDisabled();
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});
