import { render } from '@testing-library/react-native';
import type { TodoDto } from '@todos/core/http';
import { describe, expect, it } from 'vitest';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  const sample: TodoDto[] = [
    {
      id: '1',
      title: 'Write tests',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders todos when provided', () => {
    const { getByText } = render(<TodoList todos={sample} />);
    expect(getByText('Write tests')).toBeTruthy();
  });

  it('renders empty state when no todos', () => {
    const { getByText } = render(<TodoList todos={[]} />);
    expect(getByText('No todos yet')).toBeTruthy();
  });

  it('renders error state when error provided', () => {
    const { getByText } = render(<TodoList todos={[]} error="oops" />);
    expect(getByText('oops')).toBeTruthy();
  });
});
