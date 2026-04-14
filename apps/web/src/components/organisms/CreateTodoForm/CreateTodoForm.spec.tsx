import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CreateTodoForm from './CreateTodoForm';

describe('CreateTodoForm', () => {
  it('submits trimmed values when title is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateTodoForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(screen.getByTestId('form-field--todoTitle'), '  Buy milk  ');
    await user.type(
      screen.getByTestId('form-field--todoDescription'),
      '  From store  ',
    );
    await user.click(screen.getByRole('button', { name: /create todo/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'From store',
    });
  });

  it('shows validation error and blocks submit when title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateTodoForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /create todo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
