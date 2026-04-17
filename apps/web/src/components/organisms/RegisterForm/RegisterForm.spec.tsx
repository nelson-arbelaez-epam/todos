import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  const noop = () => {};

  it('renders all form fields and submit button', () => {
    render(<RegisterForm isLoading={false} error={null} onSubmit={noop} />);

    expect(screen.getByTestId('form-field--email')).toBeInTheDocument();
    expect(screen.getByTestId('form-field--password')).toBeInTheDocument();
    expect(
      screen.getByTestId('form-field--confirmPassword'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /register/i }),
    ).toBeInTheDocument();
  });

  it('shows a server-side error from props', () => {
    render(
      <RegisterForm
        isLoading={false}
        error="Email is already registered"
        onSubmit={noop}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /email is already registered/i,
    );
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm isLoading={false} error={null} onSubmit={noop} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      'user@example.com',
    );
    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.type(
      screen.getByTestId('form-field--confirmPassword'),
      'differentpass',
    );
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /passwords do not match/i,
    );
  });

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup();
    render(<RegisterForm isLoading={false} error={null} onSubmit={noop} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      'user@example.com',
    );
    await user.type(screen.getByTestId('form-field--password'), 'abc');
    await user.type(screen.getByTestId('form-field--confirmPassword'), 'abc');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /at least 6 characters/i,
    );
  });

  it('calls onSubmit with email and password when form is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm isLoading={false} error={null} onSubmit={onSubmit} />);

    await user.type(
      screen.getByTestId('form-field--email'),
      'user@example.com',
    );
    await user.type(screen.getByTestId('form-field--password'), 'password123');
    await user.type(
      screen.getByTestId('form-field--confirmPassword'),
      'password123',
    );
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('disables inputs and button while loading', () => {
    render(<RegisterForm isLoading={true} error={null} onSubmit={noop} />);

    expect(screen.getByTestId('form-field--email')).toBeDisabled();
    expect(screen.getByTestId('form-field--password')).toBeDisabled();
    expect(screen.getByTestId('form-field--confirmPassword')).toBeDisabled();

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/creating account/i);
  });
});
