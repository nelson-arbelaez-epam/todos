import { fireEvent, render } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
import { TodoItem } from './TodoItem';

describe('TodoItem', () => {
  const todo: TodoDto = {
    id: '1',
    title: 'Write tests',
    description: 'Tests',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders todo details when not editing', () => {
    const { getByText } = render(<TodoItem todo={todo} isUpdating={false} />);

    expect(getByText('Write tests')).toBeTruthy();
    expect(getByText('Tests')).toBeTruthy();
  });

  it('calls onToggleComplete when complete pressed', () => {
    const onToggleComplete = vi.fn().mockResolvedValue(true);

    const { getByText } = render(
      <TodoItem
        todo={todo}
        isUpdating={false}
        onToggleComplete={onToggleComplete}
      />,
    );

    fireEvent.press(getByText('Complete'));

    expect(onToggleComplete).toHaveBeenCalledWith(todo);
  });

  it('calls onStartEdit when edit pressed', () => {
    const onStartEdit = vi.fn();

    const { getByText } = render(
      <TodoItem todo={todo} isUpdating={false} onStartEdit={onStartEdit} />,
    );

    fireEvent.press(getByText('Edit'));

    expect(onStartEdit).toHaveBeenCalledWith(todo);
  });

  it('calls onArchive when archive pressed', () => {
    const onArchive = vi.fn().mockResolvedValue(undefined);

    const { getByTestId } = render(
      <TodoItem todo={todo} isUpdating={false} onArchive={onArchive} />,
    );

    fireEvent.press(getByTestId(`archive-todo-${todo.id}`));

    expect(onArchive).toHaveBeenCalledWith(todo);
  });

  it('disables and shows loading on Archive button when isArchiving is true', () => {
    const { getByTestId } = render(
      <TodoItem todo={todo} isUpdating={false} isArchiving />,
    );

    const archiveButton = getByTestId(`archive-todo-${todo.id}`);
    expect(archiveButton.props.accessibilityState?.disabled).toBe(true);
  });
});
