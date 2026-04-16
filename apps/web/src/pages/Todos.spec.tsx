import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '../services/todos.service';
import { resetSessionStoreForTests } from '../store/session-store';
import Todos from './Todos';

describe('Todos page', () => {
  const listSpy = vi.spyOn(TodosService, 'listTodos');
  const createSpy = vi.spyOn(TodosService, 'createTodo');

  const renderWithQueryClient = (ui: ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  beforeEach(() => {
    resetSessionStoreForTests();
    listSpy.mockReset();
    createSpy.mockReset();
  });

  it('shows loading then renders todos', async () => {
    listSpy.mockResolvedValue({
      items: [
        {
          id: '1',
          title: 'One',
          description: undefined,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });

    const { getByText } = renderWithQueryClient(<Todos />);
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('One')).toBeInTheDocument();
    });
    expect(listSpy).toHaveBeenCalledWith(undefined, { page: 1, limit: 20 });
  });

  it('shows error when service fails', async () => {
    listSpy.mockRejectedValue(new Error('Network failure'));

    const { getByRole } = renderWithQueryClient(<Todos />);

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Error: Network failure');
    });
  });

  it('creates todo and renders it in the list', async () => {
    const user = userEvent.setup();
    listSpy.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    createSpy.mockResolvedValue({
      id: 'todo-2',
      title: 'Created todo',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { getByTestId, getByRole, getByText } = renderWithQueryClient(
      <Todos />,
    );

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
    listSpy.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    createSpy.mockRejectedValue(new Error('Title must not be empty'));

    const { getByTestId, getByRole, getByText } = renderWithQueryClient(
      <Todos />,
    );
    await waitFor(() => {
      expect(getByText('No todos')).toBeInTheDocument();
    });

    await user.type(getByTestId('form-field--todoTitle'), 'Invalid');
    await user.click(getByRole('button', { name: /create todo/i }));

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Title must not be empty');
    });
  });

  it('moves to the next page and requests paginated data', async () => {
    const user = userEvent.setup();
    listSpy
      .mockResolvedValueOnce({
        items: [
          {
            id: '1',
            title: 'Page one item',
            description: undefined,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 40,
        page: 1,
        limit: 20,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: '2',
            title: 'Page two item',
            description: undefined,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 40,
        page: 2,
        limit: 20,
      });

    const { getByRole, getByText } = renderWithQueryClient(<Todos />);
    await waitFor(() => {
      expect(getByText('Page one item')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: 'Go to next page' }));

    await waitFor(() => {
      expect(getByText('Page two item')).toBeInTheDocument();
    });
    expect(listSpy).toHaveBeenLastCalledWith(undefined, { page: 2, limit: 20 });
  });
});
