import { useEffect, useRef, useState } from 'react';

const TICK_MS = 100;

interface UseCountdownOptions {
  /** Changing this restarts the countdown (e.g. a new question). */
  resetKey: string | number;
  /** Stops the clock where it is (e.g. once the question is answered). */
  paused: boolean;
  onExpire: () => void;
}

/**
 * Counts down from `totalSeconds`. Uses a fixed deadline rather than counting
 * ticks, so it stays accurate even if the JS thread is briefly busy.
 */
export function useCountdown(totalSeconds: number, { resetKey, paused, onExpire }: UseCountdownOptions) {
  const totalMs = totalSeconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    setRemainingMs(totalMs);
  }, [resetKey, totalMs]);

  useEffect(() => {
    if (paused) return;
    const deadline = Date.now() + totalMs;
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setRemainingMs(left);
      if (left === 0) {
        clearInterval(id);
        onExpireRef.current();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [resetKey, paused, totalMs]);

  return {
    secondsLeft: Math.ceil(remainingMs / 1000),
    fraction: totalMs > 0 ? remainingMs / totalMs : 0,
  };
}
