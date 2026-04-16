import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { PaginationControls } from './PaginationControls';

describe('PaginationControls', () => {
  it('renders page label', () => {
    const { getByText } = render(
      <PaginationControls
        page={2}
        totalPages={4}
        canGoToPreviousPage
        canGoToNextPage
        onPreviousPage={vi.fn()}
        onNextPage={vi.fn()}
      />,
    );

    expect(getByText('Page 2 of 4')).toBeTruthy();
  });

  it('calls callbacks when paging buttons are pressed', () => {
    const previousPage = vi.fn();
    const nextPage = vi.fn();

    const { getByText } = render(
      <PaginationControls
        page={2}
        totalPages={4}
        canGoToPreviousPage
        canGoToNextPage
        onPreviousPage={previousPage}
        onNextPage={nextPage}
      />,
    );

    fireEvent.press(getByText('Previous'));
    fireEvent.press(getByText('Next'));

    expect(previousPage).toHaveBeenCalledTimes(1);
    expect(nextPage).toHaveBeenCalledTimes(1);
  });

  it('does not call callbacks when buttons are disabled', () => {
    const previousPage = vi.fn();
    const nextPage = vi.fn();

    const { getByRole } = render(
      <PaginationControls
        page={1}
        totalPages={1}
        canGoToPreviousPage={false}
        canGoToNextPage={false}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Previous' }));
    fireEvent.press(getByRole('button', { name: 'Next' }));

    expect(previousPage).not.toHaveBeenCalled();
    expect(nextPage).not.toHaveBeenCalled();
  });
});
