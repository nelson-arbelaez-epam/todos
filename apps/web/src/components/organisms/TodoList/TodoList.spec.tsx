import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
import TodoList from './TodoList';

const mockTodo: TodoDto = {
  id: 'todo-1',
  title: 'First todo',
  description: 'A sample todo',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TodoList', () => {
  it('renders a list of todos', () => {
    const { getByText } = render(<TodoList todos={[mockTodo]} />);
    expect(getByText('First todo')).toBeInTheDocument();
  });

  it('renders empty state when no todos', () => {
    const { getByText } = render(<TodoList todos={[]} />);
    expect(getByText('No todos')).toBeInTheDocument();
  });

  it('calls onToggleComplete when Complete button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleComplete = vi.fn();
    render(<TodoList todos={[mockTodo]} onToggleComplete={onToggleComplete} />);

    await user.click(
      screen.getByRole('button', { name: `complete-${mockTodo.id}` }),
    );
    expect(onToggleComplete).toHaveBeenCalledWith(mockTodo);
  });

  it('calls onStartEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(<TodoList todos={[mockTodo]} onStartEdit={onStartEdit} />);

    await user.click(
      screen.getByRole('button', { name: `edit-${mockTodo.id}` }),
    );
    expect(onStartEdit).toHaveBeenCalledWith(mockTodo);
  });

  it('renders EditTodoForm when editingTodoId matches a todo', () => {
    const onSubmitEdit = vi.fn().mockResolvedValue(undefined);
    const onCancelEdit = vi.fn();
    render(
      <TodoList
        todos={[mockTodo]}
        editingTodoId={mockTodo.id}
        onSubmitEdit={onSubmitEdit}
        onCancelEdit={onCancelEdit}
      />,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
