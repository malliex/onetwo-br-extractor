import { useCallback, useState } from "react";
import type { Progress } from "../types/osx";

export function useProgressState() {
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0 });

  const resetProgress = useCallback(() => {
    setProgress({ current: 0, total: 0 });
  }, []);

  const updateProgress = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  return { progress, updateProgress, resetProgress };
}
