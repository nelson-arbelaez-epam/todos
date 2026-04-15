import { fireEvent, render } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it, vi } from 'vitest';
import { TodoInlineForm } from './TodoInlineForm';

describe('TodoInlineForm', () => {
  const todo: TodoDto = {
    id: '1',
    title: 'Write tests',
    description: 'Tests',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders form fields and buttons', () => {
    const { getByTestId, getByText } = render(
      <TodoInlineForm
        todo={todo}
        isUpdating={false}
        editTitle="Edited title"
        editDescription="Edited desc"
        onChangeEditTitle={vi.fn()}
        onChangeEditDescription={vi.fn()}
        onSubmitEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(getByTestId('todo-edit-title-1')).toBeTruthy();
    expect(getByTestId('todo-edit-description-1')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onSubmitEdit when Save is pressed', () => {
    const onSubmitEdit = vi.fn();

    const { getByText } = render(
      <TodoInlineForm
        todo={todo}
        isUpdating={false}
        editTitle="Edited title"
        editDescription="Edited desc"
        onSubmitEdit={onSubmitEdit}
        onCancelEdit={vi.fn()}
      />,
    );

    fireEvent.press(getByText('Save'));

    expect(onSubmitEdit).toHaveBeenCalledWith(todo.id, {
      title: 'Edited title',
      description: 'Edited desc',
    });
  });
});
