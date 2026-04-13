import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSessionStoreForTests } from '../store/session-store';
import Todos from './Todos';

vi.mock('../services/todos.service', () => ({
  listTodos: vi.fn(),
}));

describe('Todos page', () => {
  beforeEach(() => {
    resetSessionStoreForTests();
    const svc = require('../services/todos.service');
    svc.listTodos.mockReset();
  });

  it('shows loading then renders todos', async () => {
    const svc = require('../services/todos.service');
    svc.listTodos.mockResolvedValue([
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
    const svc = require('../services/todos.service');
    svc.listTodos.mockRejectedValue(new Error('Network failure'));

    const { getByRole } = render(<Todos />);

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Error: Network failure');
    });
  });
});
