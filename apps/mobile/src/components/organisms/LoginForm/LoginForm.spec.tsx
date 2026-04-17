import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation error when email is empty', () => {
    const onSubmit = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when email format is invalid', () => {
    const onSubmit = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(screen.getByTestId('login-email'), 'notanemail');
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(
      screen.getByText('Please enter a valid email address.'),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when password is too short', () => {
    const onSubmit = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(screen.getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password'), '123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(
      screen.getByText('Password must be at least 6 characters.'),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed email and password when form is valid', () => {
    const onSubmit = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(
      screen.getByTestId('login-email'),
      '  user@example.com  ',
    );
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith('user@example.com', 'password123');
  });

  it('shows server error when provided', () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        isLoading={false}
        errorMessage="Invalid email or password"
      />,
    );

    expect(screen.getByText('Invalid email or password')).toBeTruthy();
  });
});
