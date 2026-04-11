import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Label from './Label';

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders as a <label> element', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name').tagName).toBe('LABEL');
  });

  it('associates with a form control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders a required asterisk when required is true', () => {
    render(<Label required>Password</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render asterisk when required is false', () => {
    render(<Label>Username</Label>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Label className="custom-label">Label</Label>);
    const el = screen.getByText('Label');
    expect(el.className).toContain('custom-label');
  });
});
