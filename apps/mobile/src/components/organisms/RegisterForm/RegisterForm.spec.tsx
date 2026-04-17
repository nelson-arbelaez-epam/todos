import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  it('shows validation error when email is empty', () => {
    const onSubmit = vi.fn();

    render(
      <RegisterForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(
      screen.getByTestId('register-password'),
      'password123',
    );
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when password is too short', () => {
    const onSubmit = vi.fn();

    render(
      <RegisterForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(
      screen.getByTestId('register-email'),
      'user@example.com',
    );
    fireEvent.changeText(screen.getByTestId('register-password'), '123');
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(
      screen.getByText('Password must be at least 6 characters.'),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed email and password when form is valid', () => {
    const onSubmit = vi.fn();

    render(
      <RegisterForm
        onSubmit={onSubmit}
        isLoading={false}
        errorMessage={undefined}
      />,
    );

    fireEvent.changeText(
      screen.getByTestId('register-email'),
      '  user@example.com  ',
    );
    fireEvent.changeText(
      screen.getByTestId('register-password'),
      'password123',
    );
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith('user@example.com', 'password123');
  });

  it('shows server error when there is no local validation error', () => {
    render(
      <RegisterForm
        onSubmit={vi.fn()}
        isLoading={false}
        errorMessage="Email is already registered"
      />,
    );

    expect(screen.getByText('Email is already registered')).toBeTruthy();
  });
});
