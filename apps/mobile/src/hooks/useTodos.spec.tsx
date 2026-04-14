import { render, screen, waitFor } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { Text, View } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '../services/todos.service';
import {
  resetSessionStoreForTests,
  useSessionStore,
} from '../store/session-store';
import { useTodos } from './useTodos';

vi.mock('../services/todos.service');

const mockListTodos = vi.mocked(TodosService.listTodos);

describe('useTodos hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionStoreForTests();
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
});
