import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { CreateTodoForm } from './CreateTodoForm';

describe('CreateTodoForm', () => {
  it('shows validation error when title is empty', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const { getByTestId, getByText } = render(
      <CreateTodoForm onSubmit={onSubmit} isLoading={false} />,
    );

    fireEvent.press(getByTestId('create-todo-submit'));

    await waitFor(() => expect(getByText('Title is required.')).toBeTruthy());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values and clears fields on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const { getByTestId } = render(
      <CreateTodoForm onSubmit={onSubmit} isLoading={false} />,
    );

    fireEvent.changeText(getByTestId('create-todo-title'), '  New todo  ');
    fireEvent.changeText(
      getByTestId('create-todo-description'),
      '  Optional details  ',
    );
    fireEvent.press(getByTestId('create-todo-submit'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New todo',
        description: 'Optional details',
      }),
    );

    await waitFor(() =>
      expect(getByTestId('create-todo-title').props.value).toBe(''),
    );
    expect(getByTestId('create-todo-description').props.value).toBe('');
  });

  it('renders server error message', () => {
    const { getByText } = render(
      <CreateTodoForm
        onSubmit={vi.fn()}
        isLoading={false}
        errorMessage="Request failed"
      />,
    );

    expect(getByText('Request failed')).toBeTruthy();
  });
});
