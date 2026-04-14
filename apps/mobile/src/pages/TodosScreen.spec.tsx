import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTodos');
vi.mock('@/components/organisms', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    CreateTodoForm: () => React.createElement(Text, null, 'create-form'),
    TodoList: (props: {
      todos?: TodoDto[];
      onToggleComplete?: (todo: TodoDto) => Promise<void>;
      onStartEdit?: (todo: TodoDto) => void;
      onChangeEditTitle?: (value: string) => void;
      onSubmitEdit?: (
        id: string,
        payload: { title?: string; description?: string; completed?: boolean },
      ) => Promise<void>;
    }) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, props.todos?.[0]?.title ?? ''),
        React.createElement(
          Pressable,
          {
            testID: 'toggle-complete',
            onPress: () => {
              if (props.todos?.[0]) void props.onToggleComplete?.(props.todos[0]);
            },
          },
          React.createElement(Text, null, 'toggle'),
        ),
        React.createElement(
          Pressable,
          {
            testID: 'start-edit-todo',
            onPress: () => {
              if (props.todos?.[0]) {
                props.onStartEdit?.(props.todos[0]);
              }
            },
          },
          React.createElement(Text, null, 'start-edit'),
        ),
        React.createElement(
          Pressable,
          {
            testID: 'change-edit-title',
            onPress: () => {
              props.onChangeEditTitle?.('Updated title');
            },
          },
          React.createElement(Text, null, 'change-title'),
        ),
        React.createElement(
          Pressable,
          {
            testID: 'submit-edit-todo',
            onPress: () => {
              if (props.todos?.[0]) {
                void props.onSubmitEdit?.(props.todos[0].id, {
                  title: 'Updated title',
                  description: undefined,
                });
              }
            },
          },
          React.createElement(Text, null, 'submit-edit'),
        ),
      ),
  };
});

import * as UseTodos from '@/hooks/useTodos';
import TodosScreen from './TodosScreen';

const mockUseTodos = vi.mocked(UseTodos.useTodos);

describe('TodosScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todos from hook', () => {
    const mockValue: ReturnType<typeof UseTodos.useTodos> = {
      todos: [
        {
          id: '1',
          title: 'Write tests',
          description: undefined,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      isLoading: false,
      isCreating: false,
      isUpdatingTodoId: null,
      error: null,
      createError: null,
      updateError: null,
      refresh: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
    };

    mockUseTodos.mockReturnValue(mockValue);

    const { getByText } = render(<TodosScreen />);
    expect(getByText('create-form')).toBeTruthy();
    expect(getByText('Write tests')).toBeTruthy();
  });

  it('wires toggle complete and edit actions to updateTodo', async () => {
    const updateTodo = vi.fn().mockResolvedValue(true);
    const mockValue: ReturnType<typeof UseTodos.useTodos> = {
      todos: [
        {
          id: '1',
          title: 'Write tests',
          description: undefined,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      isLoading: false,
      isCreating: false,
      isUpdatingTodoId: null,
      error: null,
      createError: null,
      updateError: null,
      refresh: vi.fn(),
      createTodo: vi.fn(),
      updateTodo,
    };

    mockUseTodos.mockReturnValue(mockValue);

    const { getByTestId } = render(<TodosScreen />);

    fireEvent.press(getByTestId('toggle-complete'));
    fireEvent.press(getByTestId('start-edit-todo'));
    fireEvent.press(getByTestId('change-edit-title'));
    fireEvent.press(getByTestId('submit-edit-todo'));

    await waitFor(() =>
      expect(updateTodo).toHaveBeenNthCalledWith(1, '1', { completed: true }),
    );
    await waitFor(() =>
      expect(updateTodo).toHaveBeenNthCalledWith(2, '1', {
        title: 'Updated title',
        description: undefined,
      }),
    );
  });
});
