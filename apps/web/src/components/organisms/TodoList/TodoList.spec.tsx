import { render } from '@testing-library/react';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it } from 'vitest';
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
});
