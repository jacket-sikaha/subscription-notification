import { useRef, useEffect, useCallback } from "react";

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

interface UseAsyncState<T> {
  loading: boolean;
  data: T | null;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  immediate = false
) {
  const stateRef = useRef<UseAsyncState<T>>({
    loading: false,
    data: null,
    error: null,
  });

  const execute = useCallback(
    async (...args: Parameters<AsyncFunction<T>>): Promise<T | null> => {
      stateRef.current = { loading: true, data: null, error: null };
      try {
        const result = await asyncFunction(...args);
        stateRef.current = { loading: false, data: result, error: null };
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        stateRef.current = { loading: false, data: null, error };
        return null;
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...stateRef.current, execute };
}
