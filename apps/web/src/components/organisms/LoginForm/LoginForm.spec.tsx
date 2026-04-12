import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const noop = () => {};

  it('renders email, password fields and submit button', () => {
    render(<LoginForm isLoading={false} error={null} onSubmit={noop} />);

    expect(screen.getByTestId('form-field--email')).toBeInTheDocument();
    expect(screen.getByTestId('form-field--password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('shows a server-side error from props', () => {
    render(
      <LoginForm
        isLoading={false}
        error="Invalid email or password"
        onSubmit={noop}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /invalid email or password/i,
    );
  });

  it('calls onSubmit with email and password when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      'user@example.com',
    );
    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('disables inputs and button while loading', () => {
    render(<LoginForm isLoading={true} error={null} onSubmit={noop} />);

    expect(screen.getByTestId('form-field--email')).toBeDisabled();
    expect(screen.getByTestId('form-field--password')).toBeDisabled();

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/signing in/i);
  });

  it('does not show an alert when there is no error', () => {
    render(<LoginForm isLoading={false} error={null} onSubmit={noop} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
