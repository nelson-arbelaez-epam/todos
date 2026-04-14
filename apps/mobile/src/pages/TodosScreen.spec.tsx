import { render } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useTodos');
vi.mock('../components/organisms', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    TodoList: (props: { todos?: TodoDto[] }) =>
      React.createElement(Text, null, props.todos?.[0]?.title ?? ''),
  };
});

import * as UseTodos from '../hooks/useTodos';
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
      error: null,
      refresh: vi.fn(),
    };

    mockUseTodos.mockReturnValue(mockValue);

    const { getByText } = render(<TodosScreen />);
    expect(getByText('Write tests')).toBeTruthy();
  });
});
