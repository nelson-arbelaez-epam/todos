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

  it('calls onSubmit with trimmed email and password when form is submitted', async () => {
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

  it('shows validation error and does not call onSubmit when email is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error and does not call onSubmit when email format is invalid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(screen.getByTestId('form-field--email'), 'notanemail');
    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/valid email address/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error and does not call onSubmit when password is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      'user@example.com',
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /password is required/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace from email before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      '  user@example.com  ',
    );
    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
