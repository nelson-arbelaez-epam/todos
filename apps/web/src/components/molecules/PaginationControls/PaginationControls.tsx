export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  canGoToPreviousPage: boolean;
  canGoToNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const PaginationControls = ({
  page,
  totalPages,
  canGoToPreviousPage,
  canGoToNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) => (
  <div>
    <button
      type="button"
      onClick={onPreviousPage}
      disabled={!canGoToPreviousPage}
      aria-label="Go to previous page"
    >
      Previous
    </button>
    <span>
      Page {page} of {totalPages}
    </span>
    <button
      type="button"
      onClick={onNextPage}
      disabled={!canGoToNextPage}
      aria-label="Go to next page"
    >
      Next
    </button>
  </div>
);

export default PaginationControls;
