import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input aria-label="search" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards id to the input', () => {
    render(<Input id="username" aria-label="username" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username');
  });

  it('accepts user input', async () => {
    render(<Input aria-label="email" />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello@example.com');
    expect(input).toHaveValue('hello@example.com');
  });

  it('renders error message when error prop is provided', () => {
    render(
      <Input id="email" aria-label="email" error="This field is required" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This field is required',
    );
  });

  it('sets aria-invalid when error is provided', () => {
    render(<Input id="email" aria-label="email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links error message via aria-describedby', () => {
    render(<Input id="email" aria-label="email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'email-error',
    );
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
  });

  it('does not render error when error prop is absent', () => {
    render(<Input aria-label="email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input aria-label="email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('merges custom className', () => {
    render(<Input aria-label="email" className="my-input" />);
    expect(screen.getByRole('textbox').className).toContain('my-input');
  });
});
