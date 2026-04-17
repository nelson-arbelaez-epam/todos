import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from './FormField';

describe('FormField', () => {
  it('renders the label text', () => {
    render(<FormField id="name" label="Full name" />);
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.getByTestId('form-field--email')).toHaveAttribute(
      'id',
      'email',
    );
  });

  it('shows required indicator when required=true', () => {
    render(<FormField id="email" label="Email" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not show required indicator when required=false', () => {
    render(<FormField id="email" label="Email" required={false} />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('forwards input props to the underlying Input atom', () => {
    render(
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />,
    );
    const input = screen.getByTestId('form-field--email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('renders error text when error prop is provided', () => {
    render(<FormField id="email" label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email/i);
  });

  it('sets aria-invalid when error prop is provided', () => {
    render(<FormField id="email" label="Email" error="Required" />);
    expect(screen.getByTestId('form-field--email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('is disabled when disabled prop is true', () => {
    render(<FormField id="email" label="Email" disabled />);
    expect(screen.getByTestId('form-field--email')).toBeDisabled();
  });
});
