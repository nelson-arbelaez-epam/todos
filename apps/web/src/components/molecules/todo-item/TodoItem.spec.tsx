import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
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

  it('renders checkbox with descriptive aria-label and checked state', () => {
    const todo = { id: 'abc', title: 'Task', completed: true } as TodoDto;
    render(<TodoItem todo={todo} />);
    const checkbox = screen.getByLabelText(
      'Mark "Task" as active',
    ) as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(true);
  });

  it('does not render description when absent', () => {
    const todo = { id: '2', title: 'No desc', completed: false } as TodoDto;
    render(<TodoItem todo={todo} />);
    expect(screen.queryByText('No desc')).toBeInTheDocument();
    expect(screen.queryByText('a description')).not.toBeInTheDocument();
  });

  it('calls onToggleComplete when Complete button is clicked', async () => {
    const user = userEvent.setup();
    const todo = { id: '3', title: 'Active', completed: false } as TodoDto;
    const onToggleComplete = vi.fn();
    render(<TodoItem todo={todo} onToggleComplete={onToggleComplete} />);

    await user.click(
      screen.getByRole('button', { name: `complete-${todo.id}` }),
    );
    expect(onToggleComplete).toHaveBeenCalledWith(todo);
  });

  it('calls onToggleComplete when Mark active button is clicked for completed todo', async () => {
    const user = userEvent.setup();
    const todo = { id: '4', title: 'Done', completed: true } as TodoDto;
    const onToggleComplete = vi.fn();
    render(<TodoItem todo={todo} onToggleComplete={onToggleComplete} />);

    await user.click(
      screen.getByRole('button', { name: `mark-active-${todo.id}` }),
    );
    expect(onToggleComplete).toHaveBeenCalledWith(todo);
  });

  it('calls onStartEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const todo = { id: '5', title: 'Editable', completed: false } as TodoDto;
    const onStartEdit = vi.fn();
    render(<TodoItem todo={todo} onStartEdit={onStartEdit} />);

    await user.click(screen.getByRole('button', { name: `edit-${todo.id}` }));
    expect(onStartEdit).toHaveBeenCalledWith(todo);
  });

  it('calls onArchive when Archive button is clicked', async () => {
    const user = userEvent.setup();
    const todo = { id: '8', title: 'To archive', completed: false } as TodoDto;
    const onArchive = vi.fn();
    render(<TodoItem todo={todo} onArchive={onArchive} />);

    await user.click(
      screen.getByRole('button', { name: `archive-${todo.id}` }),
    );
    expect(onArchive).toHaveBeenCalledWith(todo);
  });

  it('disables buttons when isUpdating is true', () => {
    const todo = { id: '6', title: 'Loading', completed: false } as TodoDto;
    render(<TodoItem todo={todo} isUpdating={true} />);

    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it('applies line-through style when todo is completed', () => {
    const todo = { id: '7', title: 'Done task', completed: true } as TodoDto;
    render(<TodoItem todo={todo} />);
    const titleEl = screen.getByText('Done task');
    expect(titleEl.className).toMatch(/line-through/);
  });
});
