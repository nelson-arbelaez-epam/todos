import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  const sample: TodoDto[] = [
    {
      id: '1',
      title: 'Write tests',
      description: 'Tests',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders todos when provided', () => {
    const { getByText } = render(<TodoList todos={sample} />);
    expect(getByText('Write tests')).toBeTruthy();
  });

  it('renders empty state when no todos', () => {
    const { getByText } = render(<TodoList todos={[]} />);
    expect(getByText('No todos yet')).toBeTruthy();
  });

  it('renders loading state when isLoading is true', () => {
    const { getByText } = render(<TodoList todos={sample} isLoading />);
    expect(getByText('Loading todos…')).toBeTruthy();
  });

  it('renders error state when error provided', () => {
    const { getByText } = render(<TodoList todos={[]} error="oops" />);
    expect(getByText('oops')).toBeTruthy();
  });

  it('calls onToggleComplete when complete button is pressed', async () => {
    const onToggleComplete = vi.fn().mockResolvedValue(true);
    const { getByText } = render(
      <TodoList todos={sample} onToggleComplete={onToggleComplete} />,
    );

    fireEvent.press(getByText('Complete'));

    await waitFor(() => expect(onToggleComplete).toHaveBeenCalledWith(sample[0]));
  });

  it('submits edited values when save is pressed', async () => {
    const onUpdateTodo = vi.fn().mockResolvedValue(true);
    const { getByText, getByTestId } = render(
      <TodoList todos={sample} onUpdateTodo={onUpdateTodo} />,
    );

    fireEvent.press(getByText('Edit'));
    fireEvent.changeText(getByTestId('todo-edit-title-1'), '  Updated  ');
    fireEvent.changeText(getByTestId('todo-edit-description-1'), '  New desc  ');
    fireEvent.press(getByText('Save'));

    await waitFor(() =>
      expect(onUpdateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated',
        description: 'New desc',
      }),
    );
  });

  it('renders update error state when updateError is provided', () => {
    const { getByText } = render(<TodoList todos={sample} updateError="failed" />);
    expect(getByText('failed')).toBeTruthy();
  });
});
