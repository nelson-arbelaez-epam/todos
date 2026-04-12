import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NavBar from './NavBar';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Register', to: '/register' },
];

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('NavBar', () => {
  it('renders all provided links', () => {
    renderWithRouter(<NavBar links={links} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('renders links with correct href values', () => {
    renderWithRouter(<NavBar links={links} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    );
  });

  it('renders the brand slot when provided', () => {
    renderWithRouter(<NavBar links={links} brand={<span>Todos</span>} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
  });

  it('does not render brand slot when omitted', () => {
    const { container } = renderWithRouter(<NavBar links={links} />);
    expect(container.querySelector('.mr-auto')).not.toBeInTheDocument();
  });

  it('renders an accessible nav landmark', () => {
    renderWithRouter(<NavBar links={links} />);
    expect(
      screen.getByRole('navigation', { name: /main navigation/i }),
    ).toBeInTheDocument();
  });

  it('renders the actions slot when provided', () => {
    renderWithRouter(
      <NavBar links={links} actions={<button type="button">Sign out</button>} />,
    );
    expect(
      screen.getByRole('button', { name: 'Sign out' }),
    ).toBeInTheDocument();
  });

  it('does not render actions slot when omitted', () => {
    renderWithRouter(<NavBar links={links} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
