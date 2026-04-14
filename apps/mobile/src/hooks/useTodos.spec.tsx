import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
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

describe('useTodos hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionStoreForTests();
    mockListTodos.mockResolvedValue([]);
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

    mockListTodos.mockResolvedValue(items);

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

    render(<TestComp />);

    await waitFor(() => expect(screen.getByText('Write tests')).toBeTruthy());
    expect(mockListTodos).toHaveBeenCalledWith('token-123');
  });

  it('exposes error when service throws', async () => {
    mockListTodos.mockRejectedValue(new Error('oops'));

    function TestComp() {
      const { error } = useTodos();
      return <View>{error ? <Text>{error}</Text> : null}</View>;
    }

    render(<TestComp />);

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

    render(<TestComp />);

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

    render(<TestComp />);
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

    mockListTodos.mockResolvedValue(initialItems);
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

    render(<TestComp />);
    await waitFor(() => expect(screen.getByText('Old title')).toBeTruthy());
    fireEvent.press(screen.getByTestId('update-button'));

    await waitFor(() => expect(screen.getByText('Updated title')).toBeTruthy());
    expect(mockUpdateTodo).toHaveBeenCalledWith(
      '1',
      { title: 'Updated title', completed: true },
      undefined,
    );
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

    render(<TestComp />);
    fireEvent.press(screen.getByTestId('update-button'));

    await waitFor(() => expect(screen.getByText('update failed')).toBeTruthy());
  });
});
