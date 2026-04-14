import { render, screen } from '@testing-library/react';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it } from 'vitest';
import TodoItem from './TodoItem';

describe('TodoItem', () => {
  it('renders title and description when provided', () => {
    const todo = {
      id: '1',
      title: 'Test todo',
      description: 'a description',
      completed: false,
    } as TodoDto;
    render(<TodoItem todo={todo} />);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(screen.getByText('a description')).toBeInTheDocument();
  });

  it('renders checkbox with aria-label and checked state', () => {
    const todo = { id: 'abc', title: 'Task', completed: true } as TodoDto;
    render(<TodoItem todo={todo} />);
    const checkbox = screen.getByLabelText('completed-abc') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(true);
  });

  it('does not render description when absent', () => {
    const todo = { id: '2', title: 'No desc', completed: false } as TodoDto;
    render(<TodoItem todo={todo} />);
    expect(screen.queryByText('No desc')).toBeInTheDocument();
    expect(screen.queryByText('a description')).not.toBeInTheDocument();
  });
});
