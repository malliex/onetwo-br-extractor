import { useCallback, useState } from "react";

export function useProcessingState(initial = false) {
  const [isProcessing, setIsProcessing] = useState<boolean>(initial);

  const startProcessing = useCallback(() => setIsProcessing(true), []);
  const stopProcessing = useCallback(() => setIsProcessing(false), []);

  const withProcessing = useCallback(
    async <T>(job: () => Promise<T>): Promise<T> => {
      startProcessing();
      try {
        return await job();
      } finally {
        stopProcessing();
      }
    },
    [startProcessing, stopProcessing]
  );

  return { isProcessing, startProcessing, stopProcessing, withProcessing };
}
