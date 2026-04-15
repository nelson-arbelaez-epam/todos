import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTodos');

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
      // removed isUpdatingTodoId (now using updating map)
      error: null,
      createError: null,
      updateError: null,
      updating: {},
      page: 1,
      total: 1,
      totalPages: 1,
      canGoToPreviousPage: false,
      canGoToNextPage: false,
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      refresh: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      clearUpdateError: vi.fn(),
    };

    mockUseTodos.mockReturnValue(mockValue);

    const { getByText, getByTestId } = render(<TodosScreen />);
    expect(getByTestId('create-todo-title')).toBeTruthy();
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
      error: null,
      createError: null,
      updateError: null,
      updating: {},
      page: 1,
      total: 1,
      totalPages: 1,
      canGoToPreviousPage: false,
      canGoToNextPage: false,
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      refresh: vi.fn(),
      createTodo: vi.fn(),
      updateTodo,
      clearUpdateError: vi.fn(),
    };

    mockUseTodos.mockReturnValue(mockValue);

    const { getByTestId } = render(<TodosScreen />);

    fireEvent.press(getByTestId('toggle-complete-1'));
    fireEvent.press(getByTestId('edit-todo-1'));
    fireEvent.changeText(getByTestId('todo-edit-title-1'), 'Updated title');
    fireEvent.press(getByTestId('todo-submit-edit-1'));

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
