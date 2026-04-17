import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PaginationControls from './PaginationControls';

describe('PaginationControls', () => {
  it('renders current page and total pages', () => {
    const { getByText } = render(
      <PaginationControls
        page={2}
        totalPages={5}
        canGoToPreviousPage
        canGoToNextPage
        onPreviousPage={vi.fn()}
        onNextPage={vi.fn()}
      />,
    );

    expect(getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('disables navigation buttons when page bounds are reached', () => {
    const { getByRole } = render(
      <PaginationControls
        page={1}
        totalPages={1}
        canGoToPreviousPage={false}
        canGoToNextPage={false}
        onPreviousPage={vi.fn()}
        onNextPage={vi.fn()}
      />,
    );

    expect(getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
    expect(getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });
});
