import { useCallback, useEffect, useRef, useState } from 'react';

export function useApi<T, Args extends unknown[]>(request: (signal: AbortSignal, ...args: Args) => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const active = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    active.current?.abort();
    active.current = null;ㄔㄛ
    setIsLoading(false);
  }, []);

  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    []
  );

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      setIsLoading(true);
      setError(null);
      try {
        const result = await request(controller.signal, ...args);
        if (controller.signal.aborted || active.current !== controller)
          throw new DOMException('請求已取消。', 'AbortError');
        setData(result);
        return result;
      } catch (cause) {
        const failure = cause instanceof Error ? cause : new Error('無法完成請求。');
        if (!controller.signal.aborted && active.current === controller) setError(failure);
        throw failure;
      } finally {
        if (active.current === controller) {
          active.current = null;
          setIsLoading(false);
        }
      }
    },
    [request]
  );

  const reset = useCallback(() => {
    cancel();
    setData(undefined);
    setError(null);
  }, [cancel]);

  return { data, error, isLoading, execute, cancel, reset };
}
