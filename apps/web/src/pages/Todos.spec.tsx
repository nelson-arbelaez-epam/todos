import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as TodosService from '../services/todos.service';
import { resetSessionStoreForTests } from '../store/session-store';
import Todos from './Todos';

describe('Todos page', () => {
  const listSpy = vi.spyOn(TodosService, 'listTodos');
  beforeEach(() => {
    resetSessionStoreForTests();
    listSpy.mockReset();
  });

  it('shows loading then renders todos', async () => {
    listSpy.mockResolvedValue([
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
    listSpy.mockRejectedValue(new Error('Network failure'));

    const { getByRole } = render(<Todos />);

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Error: Network failure');
    });
  });
});
