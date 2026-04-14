import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '../services/todos.service';
import { resetSessionStoreForTests } from '../store/session-store';
import Todos from './Todos';

describe('Todos page', () => {
  const listSpy = vi.spyOn(TodosService, 'listTodos');
  const createSpy = vi.spyOn(TodosService, 'createTodo');
  beforeEach(() => {
    resetSessionStoreForTests();
    listSpy.mockReset();
    createSpy.mockReset();
  });

  it('shows loading then renders todos', async () => {
    listSpy.mockResolvedValue([
      {
        id: '1',
        title: 'One',
        description: undefined,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { getByText } = render(<Todos />);
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('One')).toBeInTheDocument();
    });
  });

  it('shows error when service fails', async () => {
    listSpy.mockRejectedValue(new Error('Network failure'));

    const { getByRole } = render(<Todos />);

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Error: Network failure');
    });
  });

  it('creates todo and renders it in the list', async () => {
    const user = userEvent.setup();
    listSpy.mockResolvedValue([]);
    createSpy.mockResolvedValue({
      id: 'todo-2',
      title: 'Created todo',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { getByTestId, getByRole, getByText } = render(<Todos />);

    await waitFor(() => {
      expect(getByText('No todos')).toBeInTheDocument();
    });

    await user.type(getByTestId('form-field--todoTitle'), 'Created todo');
    await user.click(getByRole('button', { name: /create todo/i }));

    await waitFor(() => {
      expect(getByText('Created todo')).toBeInTheDocument();
    });
  });

  it('shows create error when create request fails', async () => {
    const user = userEvent.setup();
    listSpy.mockResolvedValue([]);
    createSpy.mockRejectedValue(new Error('Title must not be empty'));

    const { getByTestId, getByRole, getByText } = render(<Todos />);
    await waitFor(() => {
      expect(getByText('No todos')).toBeInTheDocument();
    });

    await user.type(getByTestId('form-field--todoTitle'), 'Invalid');
    await user.click(getByRole('button', { name: /create todo/i }));

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Title must not be empty');
    });
  });
});
