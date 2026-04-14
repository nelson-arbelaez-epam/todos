import { View } from 'react-native';
import { AppButton, AppText } from '@/components/atoms';

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  canGoToPreviousPage: boolean;
  canGoToNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function PaginationControls({
  page,
  totalPages,
  canGoToPreviousPage,
  canGoToNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <>
      <AppText variant="caption" className="mt-3 text-text-secondary">
        Page {page} of {totalPages}
      </AppText>
      <View className="mt-2 flex-row gap-2">
        <AppButton
          title="Previous"
          variant="secondary"
          onPress={() => {
            if (canGoToPreviousPage) onPreviousPage();
          }}
          disabled={!canGoToPreviousPage}
        />
        <AppButton
          title="Next"
          variant="secondary"
          onPress={() => {
            if (canGoToNextPage) onNextPage();
          }}
          disabled={!canGoToNextPage}
        />
      </View>
    </>
  );
}
