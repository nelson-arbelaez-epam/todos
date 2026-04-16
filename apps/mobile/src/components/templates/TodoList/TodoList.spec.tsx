import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { useState } from 'react';
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

    await waitFor(() =>
      expect(onToggleComplete).toHaveBeenCalledWith(sample[0]),
    );
  });

  it('calls edit callbacks and submits trimmed values', async () => {
    // Stateful wrapper to simulate edit flow
    const onSubmitEdit = vi.fn();

    function Wrapper() {
      const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
      const [editTitle, setEditTitle] = useState('');
      const [editDescription, setEditDescription] = useState('');
      return (
        <TodoList
          todos={sample}
          editingTodoId={editingTodoId}
          editTitle={editTitle}
          editDescription={editDescription}
          onStartEdit={(todo) => {
            setEditingTodoId(todo.id);
            setEditTitle(todo.title);
            setEditDescription(todo.description ?? '');
          }}
          onChangeEditTitle={setEditTitle}
          onChangeEditDescription={setEditDescription}
          onSubmitEdit={onSubmitEdit}
          onCancelEdit={() => setEditingTodoId(null)}
        />
      );
    }
    const { getByText, getByTestId } = render(<Wrapper />);
    fireEvent.press(getByText('Edit'));
    fireEvent.changeText(getByTestId('todo-edit-title-1'), '  Updated  ');
    fireEvent.changeText(
      getByTestId('todo-edit-description-1'),
      '  New desc  ',
    );
    // Simulate Save
    fireEvent.press(getByText('Save'));
    expect(onSubmitEdit).toHaveBeenCalledWith(sample[0].id, {
      title: '  Updated  ',
      description: '  New desc  ',
    });
  });

  it('renders update error state when updateError is provided', () => {
    const { getByText } = render(
      <TodoList todos={sample} updateError="failed" />,
    );
    expect(getByText('failed')).toBeTruthy();
  });

  it('calls onArchive when archive button is pressed', async () => {
    const onArchive = vi.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TodoList todos={sample} onArchive={onArchive} />,
    );

    fireEvent.press(getByTestId(`archive-todo-${sample[0].id}`));

    await waitFor(() =>
      expect(onArchive).toHaveBeenCalledWith(sample[0]),
    );
  });
});
