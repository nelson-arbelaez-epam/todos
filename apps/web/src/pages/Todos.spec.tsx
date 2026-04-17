import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '../services/todos.service';
import { getTodosQueryKey } from '../query/query-client';
import { resetSessionStoreForTests } from '../store/session-store';
import Todos from './Todos';

describe('Todos page', () => {
  const listSpy = vi.spyOn(TodosService, 'listTodos');
  const createSpy = vi.spyOn(TodosService, 'createTodo');
  const updateSpy = vi.spyOn(TodosService, 'updateTodo');
  const archiveSpy = vi.spyOn(TodosService, 'archiveTodo');

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
    updateSpy.mockReset();
    archiveSpy.mockReset();
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

  it('toggles todo complete status when Complete button is clicked', async () => {
    const user = userEvent.setup();
    const todo = {
      id: 'todo-toggle',
      title: 'Toggle me',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy.mockResolvedValue({
      items: [todo],
      total: 1,
      page: 1,
      limit: 20,
    });
    updateSpy.mockResolvedValue({ ...todo, completed: true });

    const { getByRole, getByText } = renderWithQueryClient(<Todos />);
    await waitFor(() => {
      expect(getByText('Toggle me')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: `complete-${todo.id}` }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        todo.id,
        { completed: true },
        undefined,
      );
    });
  });

  it('opens edit form when Edit button is clicked and saves changes', async () => {
    const user = userEvent.setup();
    const todo = {
      id: 'todo-edit',
      title: 'Editable todo',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy.mockResolvedValue({
      items: [todo],
      total: 1,
      page: 1,
      limit: 20,
    });
    updateSpy.mockResolvedValue({ ...todo, title: 'Updated title' });

    const { getByRole, getByText, getByTestId } = renderWithQueryClient(
      <Todos />,
    );
    await waitFor(() => {
      expect(getByText('Editable todo')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: `edit-${todo.id}` }));

    // Edit form should appear
    expect(getByRole('button', { name: /save/i })).toBeInTheDocument();

    const titleInput = getByTestId(`form-field--editTodoTitle-${todo.id}`);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    await user.click(getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        todo.id,
        { title: 'Updated title', description: undefined },
        undefined,
      );
    });
  });

  it('closes edit form when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const todo = {
      id: 'todo-cancel',
      title: 'Cancel edit',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy.mockResolvedValue({
      items: [todo],
      total: 1,
      page: 1,
      limit: 20,
    });

    const { getByRole, getByText } = renderWithQueryClient(<Todos />);
    await waitFor(() => {
      expect(getByText('Cancel edit')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: `edit-${todo.id}` }));
    expect(getByRole('button', { name: /save/i })).toBeInTheDocument();

    await user.click(getByRole('button', { name: /cancel/i }));

    // Edit form should be gone; normal todo item buttons should be back
    await waitFor(() => {
      expect(
        getByRole('button', { name: `edit-${todo.id}` }),
      ).toBeInTheDocument();
    });
  });

  it('archives todo and removes it from the list when Archive button is clicked', async () => {
    const user = userEvent.setup();
    const todo = {
      id: 'todo-archive',
      title: 'Archive me',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy
      // initial load
      .mockResolvedValueOnce({ items: [todo], total: 1, page: 1, limit: 20 })
      // background refetch triggered by invalidateQueries after archive
      .mockResolvedValueOnce({ items: [], total: 0, page: 1, limit: 20 });
    archiveSpy.mockResolvedValue({
      ...todo,
      archivedAt: new Date(),
      updatedAt: new Date(),
    });

    const { getByRole, getByText, queryByText } = renderWithQueryClient(
      <Todos />,
    );
    await waitFor(() => {
      expect(getByText('Archive me')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: `archive-${todo.id}` }));

    await waitFor(() => {
      expect(archiveSpy).toHaveBeenCalledWith(todo.id, undefined);
      expect(queryByText('Archive me')).not.toBeInTheDocument();
    });
  });

  it('shows archive error when archive request fails', async () => {
    const user = userEvent.setup();
    const todo = {
      id: 'todo-archive-err',
      title: 'Archive fails',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy.mockResolvedValue({
      items: [todo],
      total: 1,
      page: 1,
      limit: 20,
    });
    archiveSpy.mockRejectedValue(new Error('Archive failed'));

    const { getByRole, getByText, findAllByRole } = renderWithQueryClient(
      <Todos />,
    );
    await waitFor(() => {
      expect(getByText('Archive fails')).toBeInTheDocument();
    });

    await user.click(getByRole('button', { name: `archive-${todo.id}` }));

    await waitFor(async () => {
      const alerts = await findAllByRole('alert');
      expect(alerts.some((el) => el.textContent?.includes('Archive failed'))).toBe(true);
    });
  });

  it('excludes archived todos from the active list', async () => {
    const activeTodo = {
      id: 'active-1',
      title: 'Active todo',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const archivedTodo = {
      id: 'archived-1',
      title: 'Archived todo',
      description: undefined,
      completed: false,
      archivedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listSpy.mockResolvedValue({
      items: [activeTodo, archivedTodo],
      total: 2,
      page: 1,
      limit: 20,
    });

    const { getByText, queryByText } = renderWithQueryClient(<Todos />);

    await waitFor(() => {
      expect(getByText('Active todo')).toBeInTheDocument();
    });
    expect(queryByText('Archived todo')).not.toBeInTheDocument();
  });

  it('invalidates page 2 cache after archiving from page 1 so stale data is not served', async () => {
    const user = userEvent.setup();

    // Use staleTime: Infinity so queries never auto-refetch — only explicit
    // invalidation (our archive path) should cause page 2 to be re-fetched.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    const page1Todos = Array.from({ length: 20 }, (_, i) => ({
      id: `p1-todo-${i + 1}`,
      title: `Page 1 Todo ${i + 1}`,
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const page2Todo = {
      id: 'p2-todo-1',
      title: 'Page 2 Todo',
      description: undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use total: 40 so that even after archiving 1 item (total → 39),
    // page 2 still exists (ceil(39/20) = 2) and the "Next page" button is enabled.
    // Seed page 2 directly into the cache — no listSpy call for page 2 yet.
    queryClient.setQueryData(getTodosQueryKey(undefined, 2, 20), {
      items: [page2Todo],
      total: 40,
      page: 2,
      limit: 20,
    });

    listSpy
      // initial page 1 load (total 40 → 2 pages exist)
      .mockResolvedValueOnce({
        items: page1Todos,
        total: 40,
        page: 1,
        limit: 20,
      })
      // background refetch of page 1 after archive invalidation
      .mockResolvedValueOnce({
        items: page1Todos.slice(1),
        total: 39,
        page: 1,
        limit: 20,
      })
      // page 2 refetch after navigating (triggered by invalidation, not by staleTime)
      .mockResolvedValueOnce({
        items: [page2Todo],
        total: 39,
        page: 2,
        limit: 20,
      });

    archiveSpy.mockResolvedValue({
      ...page1Todos[0],
      archivedAt: new Date(),
      updatedAt: new Date(),
    });

    const { getByRole, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Todos />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(getByText('Page 1 Todo 1')).toBeInTheDocument(),
    );

    // Archive an item from page 1
    await user.click(
      getByRole('button', { name: `archive-${page1Todos[0].id}` }),
    );
    await waitFor(() =>
      expect(archiveSpy).toHaveBeenCalledWith(page1Todos[0].id, undefined),
    );

    // Wait for the background refetch of page 1 to complete so total is updated
    // and the "Next page" button becomes enabled.
    await waitFor(() =>
      expect(listSpy).toHaveBeenCalledWith(undefined, { page: 1, limit: 20 }),
    );

    const page2CallsBefore = listSpy.mock.calls.filter(
      ([, params]) => (params as { page?: number })?.page === 2,
    ).length;

    // Navigate to page 2 — because the cache was invalidated it must refetch
    // (with staleTime: Infinity it would be served from cache if not invalidated)
    await user.click(getByRole('button', { name: 'Go to next page' }));

    await waitFor(() =>
      expect(getByText('Page 2 Todo')).toBeInTheDocument(),
    );

    const page2CallsAfter = listSpy.mock.calls.filter(
      ([, params]) => (params as { page?: number })?.page === 2,
    ).length;

    expect(page2CallsAfter).toBeGreaterThan(page2CallsBefore);
  });
});
