import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Text from './Text';

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as <p> by default for body variant', () => {
    render(<Text variant="body">Body text</Text>);
    expect(screen.getByText('Body text').tagName).toBe('P');
  });

  it('renders as <h1> for heading-1 variant', () => {
    render(<Text variant="heading-1">Page Title</Text>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Page Title',
    );
  });

  it('renders as <h2> for heading-2 variant', () => {
    render(<Text variant="heading-2">Section Title</Text>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Section Title',
    );
  });

  it('renders as <h3> for heading-3 variant', () => {
    render(<Text variant="heading-3">Sub Title</Text>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Sub Title',
    );
  });

  it('overrides rendered element via as prop', () => {
    render(
      <Text variant="body" as="span">
        Span text
      </Text>,
    );
    expect(screen.getByText('Span text').tagName).toBe('SPAN');
  });

  it('applies heading-1 classes', () => {
    render(<Text variant="heading-1">Title</Text>);
    expect(screen.getByText('Title').className).toContain('text-4xl');
  });

  it('applies body-sm classes', () => {
    render(<Text variant="body-sm">Small</Text>);
    expect(screen.getByText('Small').className).toContain('text-sm');
  });

  it('applies caption classes', () => {
    render(<Text variant="caption">Caption</Text>);
    expect(screen.getByText('Caption').className).toContain('text-xs');
  });

  it('merges custom className', () => {
    render(<Text className="custom-text">Text</Text>);
    expect(screen.getByText('Text').className).toContain('custom-text');
  });
});
