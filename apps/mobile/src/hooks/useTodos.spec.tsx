import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { TodoDto, TodoListDto } from '@todos/core/http';
import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '@/services/todos.service';
import {
  resetSessionStoreForTests,
  useSessionStore,
} from '@/store/session-store';
import { useTodos } from './useTodos';

vi.mock('@/services/todos.service');

const mockListTodos = vi.mocked(TodosService.listTodos);
const mockCreateTodo = vi.mocked(TodosService.createTodo);
const mockUpdateTodo = vi.mocked(TodosService.updateTodo);
const mockArchiveTodo = vi.mocked(TodosService.archiveTodo);

const emptyPage: TodoListDto = { items: [], total: 0, page: 1, limit: 20 };

function renderWithQueryClient(ui: ReactElement) {
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
}

describe('useTodos hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionStoreForTests();
    mockListTodos.mockResolvedValue(emptyPage);
  });

  it('fetches todos and exposes them', async () => {
    const items: TodoDto[] = [
      {
        id: '1',
        title: 'Write tests',
        description: undefined,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockListTodos.mockResolvedValue({ items, total: 1, page: 1, limit: 20 });

    useSessionStore.setState({
      currentUser: {
        uid: 'u',
        email: 'e',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    function TestComp() {
      const { todos, isLoading, error } = useTodos();
      return (
        <View>
          {isLoading ? <Text>loading</Text> : null}
          {error ? <Text>{error}</Text> : null}
          {todos.map((t) => (
            <Text key={t.id}>{t.title}</Text>
          ))}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);

    await waitFor(() => expect(screen.getByText('Write tests')).toBeTruthy());
    expect(mockListTodos).toHaveBeenCalledWith('token-123', {
      page: 1,
      limit: 20,
    });
  });

  it('exposes error when service throws', async () => {
    mockListTodos.mockRejectedValue(new Error('oops'));

    function TestComp() {
      const { error } = useTodos();
      return <View>{error ? <Text>{error}</Text> : null}</View>;
    }

    renderWithQueryClient(<TestComp />);

    await waitFor(() => expect(screen.getByText('oops')).toBeTruthy());
  });

  it('creates todo and prepends it to the list', async () => {
    mockCreateTodo.mockResolvedValue({
      id: '2',
      title: 'Created todo',
      description: 'Desc',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    useSessionStore.setState({
      currentUser: {
        uid: 'u',
        email: 'e',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    function TestComp() {
      const { todos, createTodo } = useTodos();
      return (
        <View>
          <Pressable
            testID="create-button"
            onPress={() => {
              void createTodo({ title: 'Created todo', description: 'Desc' });
            }}
          >
            <Text>create</Text>
          </Pressable>
          {todos.map((t) => (
            <Text key={t.id}>{t.title}</Text>
          ))}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);

    await waitFor(() => expect(screen.getByText('create')).toBeTruthy());
    fireEvent.press(screen.getByTestId('create-button'));

    await waitFor(() => expect(screen.getByText('Created todo')).toBeTruthy());
    expect(mockCreateTodo).toHaveBeenCalledWith(
      { title: 'Created todo', description: 'Desc' },
      'token-123',
    );
  });

  it('exposes create error when create request fails', async () => {
    mockCreateTodo.mockRejectedValue(new Error('create failed'));

    function TestComp() {
      const { createTodo, createError } = useTodos();
      return (
        <View>
          <Pressable
            testID="create-button"
            onPress={() => {
              void createTodo({ title: 'x' });
            }}
          >
            <Text>create</Text>
          </Pressable>
          {createError ? <Text>{createError}</Text> : null}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);
    fireEvent.press(screen.getByTestId('create-button'));

    await waitFor(() => expect(screen.getByText('create failed')).toBeTruthy());
  });

  it('updates todo and replaces item in list', async () => {
    const initialItems: TodoDto[] = [
      {
        id: '1',
        title: 'Old title',
        description: 'Old desc',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockListTodos.mockResolvedValue({
      items: initialItems,
      total: 1,
      page: 1,
      limit: 20,
    });
    mockUpdateTodo.mockResolvedValue({
      ...initialItems[0],
      title: 'Updated title',
      completed: true,
    });

    function TestComp() {
      const { todos, updateTodo } = useTodos();
      return (
        <View>
          <Pressable
            testID="update-button"
            onPress={() => {
              void updateTodo('1', { title: 'Updated title', completed: true });
            }}
          >
            <Text>update</Text>
          </Pressable>
          {todos.map((t) => (
            <Text key={t.id}>{t.title}</Text>
          ))}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);
    await waitFor(() => expect(screen.getByText('Old title')).toBeTruthy());
    fireEvent.press(screen.getByTestId('update-button'));

    await waitFor(() => expect(screen.getByText('Updated title')).toBeTruthy());
    expect(mockUpdateTodo).toHaveBeenCalledWith(
      '1',
      { title: 'Updated title', completed: true },
      undefined,
    );
  });

  it('blocks concurrent update requests for the same todo', async () => {
    const initialItems: TodoDto[] = [
      {
        id: '1',
        title: 'Old title',
        description: 'Old desc',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockListTodos.mockResolvedValue({
      items: initialItems,
      total: 1,
      page: 1,
      limit: 20,
    });

    let resolveUpdate: ((value: TodoDto) => void) | null = null;
    mockUpdateTodo.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    useSessionStore.setState({
      currentUser: {
        uid: 'u',
        email: 'e',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    let updateTodoFn: ReturnType<typeof useTodos>['updateTodo'];

    function TestComp() {
      const { updateTodo } = useTodos();
      updateTodoFn = updateTodo;
      return null;
    }

    renderWithQueryClient(<TestComp />);

    let secondResult: boolean | undefined;

    await act(async () => {
      const firstPromise = updateTodoFn('1', {
        title: 'Updated title',
        completed: true,
      });
      secondResult = await updateTodoFn('1', {
        title: 'Updated title',
        completed: true,
      });
      expect(secondResult).toBe(false);
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
      resolveUpdate?.({
        ...initialItems[0],
        title: 'Updated title',
        completed: true,
      });
      await firstPromise;
    });
  });

  it('exposes update error when update request fails', async () => {
    mockUpdateTodo.mockRejectedValue(new Error('update failed'));

    function TestComp() {
      const { updateTodo, updateError } = useTodos();
      return (
        <View>
          <Pressable
            testID="update-button"
            onPress={() => {
              void updateTodo('1', { completed: true });
            }}
          >
            <Text>update</Text>
          </Pressable>
          {updateError ? <Text>{updateError}</Text> : null}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);
    fireEvent.press(screen.getByTestId('update-button'));

    await waitFor(() => expect(screen.getByText('update failed')).toBeTruthy());
  });

  it('updates page and requests paged todos', async () => {
    mockListTodos
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

    function TestComp() {
      const { todos, nextPage, canGoToNextPage } = useTodos();
      return (
        <View>
          <Pressable
            testID="next-page"
            onPress={() => {
              if (canGoToNextPage) nextPage();
            }}
          >
            <Text>next</Text>
          </Pressable>
          {todos.map((t) => (
            <Text key={t.id}>{t.title}</Text>
          ))}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);

    await waitFor(() => expect(screen.getByText('Page one item')).toBeTruthy());
    fireEvent.press(screen.getByTestId('next-page'));
    await waitFor(() => expect(screen.getByText('Page two item')).toBeTruthy());
    expect(mockListTodos).toHaveBeenLastCalledWith(undefined, {
      page: 2,
      limit: 20,
    });
  });

  it('blocks concurrent update requests for the same todo', async () => {
    const initialItems: TodoListDto = {
      page: 1,
      limit: 20,
      total: 1,
      items: [
        {
          id: '1',
          title: 'Old title',
          description: 'Old desc',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    mockListTodos.mockResolvedValue(initialItems);

    let resolveUpdate: ((value: TodoDto) => void) | null = null;
    mockUpdateTodo.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    useSessionStore.setState({
      currentUser: {
        uid: 'u',
        email: 'e',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    let updateTodoFn: ReturnType<typeof useTodos>['updateTodo'];

    function TestComp() {
      const { updateTodo } = useTodos();
      updateTodoFn = updateTodo;
      return null;
    }

    renderWithQueryClient(<TestComp />);

    let secondResult: boolean | undefined;

    await act(async () => {
      const firstPromise = updateTodoFn('1', {
        title: 'Updated title',
        completed: true,
      });
      secondResult = await updateTodoFn('1', {
        title: 'Updated title',
        completed: true,
      });
      expect(secondResult).toBe(false);
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
      resolveUpdate?.({
        ...initialItems.items[0],
        title: 'Updated title',
        completed: true,
      });
      await firstPromise;
    });
  });

  it('exposes update error when update request fails', async () => {
    mockUpdateTodo.mockRejectedValue(new Error('update failed'));

    function TestComp() {
      const { updateTodo, updateError } = useTodos();
      return (
        <View>
          <Pressable
            testID="update-button"
            onPress={() => {
              void updateTodo('1', { completed: true });
            }}
          >
            <Text>update</Text>
          </Pressable>
          {updateError ? <Text>{updateError}</Text> : null}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);
    fireEvent.press(screen.getByTestId('update-button'));

    await waitFor(() => expect(screen.getByText('update failed')).toBeTruthy());
  });

  it('archives todo and removes it from the list', async () => {
    const initialItems: TodoDto[] = [
      {
        id: '1',
        title: 'To archive',
        description: undefined,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockListTodos.mockResolvedValue({
      items: initialItems,
      total: 1,
      page: 1,
      limit: 20,
    });
    mockArchiveTodo.mockResolvedValue({
      ...initialItems[0],
      archivedAt: new Date(),
    });

    useSessionStore.setState({
      currentUser: {
        uid: 'u',
        email: 'e',
        idToken: 'token-123',
        expiresIn: '3600',
      },
    });

    function TestComp() {
      const { todos, archiveTodo } = useTodos();
      return (
        <View>
          <Pressable
            testID="archive-button"
            onPress={() => {
              void archiveTodo('1');
            }}
          >
            <Text>archive</Text>
          </Pressable>
          {todos.map((t) => (
            <Text key={t.id}>{t.title}</Text>
          ))}
        </View>
      );
    }

    renderWithQueryClient(<TestComp />);

    await waitFor(() => expect(screen.getByText('To archive')).toBeTruthy());
    fireEvent.press(screen.getByTestId('archive-button'));

    await waitFor(() =>
      expect(screen.queryByText('To archive')).toBeNull(),
    );
    expect(mockArchiveTodo).toHaveBeenCalledWith('1', 'token-123');
  });
});
