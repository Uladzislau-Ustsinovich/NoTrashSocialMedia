import { useEffect, useRef, useState } from 'react';

/** Counts down from `seconds` to 0, one per second, then calls `onDone` once. */
export function useCountdown(seconds: number, onDone: () => void): number {
  const [left, setLeft] = useState(seconds);
  const onDoneRef = useRef(onDone);
  // Keep the latest callback without restarting the countdown.
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (left <= 0) {
      onDoneRef.current();
      return;
    }
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return left;
}
