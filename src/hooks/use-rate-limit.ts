import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/api/api-error';

export function useRateLimit() {
  const deadline = useRef(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  useEffect(() => {
    if (!remainingSeconds) return;
    const timer = setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(timer);
  }, [remainingSeconds]);
  function capture(error: unknown) {
    if (!(error instanceof ApiError) || error.status !== 429) return;
    const seconds = error.retryAfterSeconds ?? 0;
    deadline.current = Math.max(deadline.current, Date.now() + seconds * 1000);
    setRemainingSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
  }
  return {
    remainingSeconds,
    message: remainingSeconds > 0 ? `請於 ${remainingSeconds} 秒後再試` : '',
    isBlocked: () => Date.now() < deadline.current,
    capture,
  };
}
