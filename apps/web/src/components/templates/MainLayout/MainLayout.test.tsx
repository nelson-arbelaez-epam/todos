import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MainLayout from './MainLayout';

describe('MainLayout', () => {
  it('renders children inside <main>', () => {
    render(<MainLayout>Page content</MainLayout>);
    expect(screen.getByRole('main')).toHaveTextContent('Page content');
  });

  it('renders header slot when provided', () => {
    render(<MainLayout header={<nav>Navigation</nav>}>Content</MainLayout>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders footer slot when provided', () => {
    render(<MainLayout footer={<p>Footer text</p>}>Content</MainLayout>);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('does not render header element when header is absent', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('does not render footer element when footer is absent', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
