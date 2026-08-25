import { useCallback, useEffect, useRef, useState } from "react";
import { LOADING_CONFIG } from "../_utils/const";

/**
 * Hook que gerencia o estado de loading com progress bar
 *
 * Uso:
 * const { loading, error, startLoading, stopLoading } = useLoadingManager();
 *
 * // Em uma ação async:
 * const handler = async () => {
 *   const interval = startLoading();
 *   try {
 *     await api.call();
 *     stopLoading(interval, true);
 *   } catch (err) {
 *     stopLoading(interval, false);
 *   }
 * };
 */
export function useLoadingManager() {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setLoading(0);
    setError(false);

    const interval = setInterval(() => {
      setLoading((prev) => {
        if (prev >= LOADING_CONFIG.MAX_PROGRESS) {
          return prev;
        }
        return prev + 1;
      });
    }, LOADING_CONFIG.INTERVAL);

    intervalRef.current = interval;
    return interval;
  }, []);

  const stopLoading = useCallback(
    (interval: NodeJS.Timeout, success: boolean) => {
      clearInterval(interval);

      if (success) {
        setLoading(LOADING_CONFIG.COMPLETE_DURATION);
        setError(false);

        setTimeout(() => {
          setLoading(0);
        }, LOADING_CONFIG.SUCCESS_RESET_DELAY);
      } else {
        setLoading(0);
        setError(true);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setLoading(0);
    setError(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    reset,
  };
}
