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

  it('calls edit callbacks when edit controls are used', async () => {
    const onStartEdit = vi.fn();
    const onSubmitEdit = vi.fn().mockResolvedValue(undefined);
    const onCancelEdit = vi.fn();
    const onChangeEditTitle = vi.fn();
    const onChangeEditDescription = vi.fn();

    const { getByText, rerender, getByTestId } = render(
      <TodoList todos={sample} onStartEdit={onStartEdit} />,
    );

    fireEvent.press(getByText('Edit'));
    expect(onStartEdit).toHaveBeenCalledWith(sample[0]);

    rerender(
      <TodoList
        todos={sample}
        editingTodoId="1"
        editTitle="Write tests"
        editDescription="Tests"
        onStartEdit={onStartEdit}
        onSubmitEdit={onSubmitEdit}
        onCancelEdit={onCancelEdit}
        onChangeEditTitle={onChangeEditTitle}
        onChangeEditDescription={onChangeEditDescription}
      />,
    );

    fireEvent.changeText(getByTestId('todo-edit-title-1'), '  Updated  ');
    fireEvent.changeText(getByTestId('todo-edit-description-1'), '  New desc  ');
    fireEvent.press(getByText('Save'));
    fireEvent.press(getByText('Cancel'));

    expect(onChangeEditTitle).toHaveBeenCalledWith('  Updated  ');
    expect(onChangeEditDescription).toHaveBeenCalledWith('  New desc  ');
    await waitFor(() =>
      expect(onSubmitEdit).toHaveBeenCalledWith('1', {
        title: 'Write tests',
        description: 'Tests',
      }),
    );
    expect(onCancelEdit).toHaveBeenCalled();
  });

  it('renders update error state when updateError is provided', () => {
    const { getByText } = render(<TodoList todos={sample} updateError="failed" />);
    expect(getByText('failed')).toBeTruthy();
  });
});
