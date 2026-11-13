import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time, refreshed whenever the screen regains focus or the app returns to the
 * foreground, so anything that depends on "today" is right after the app sat open overnight.
 * Pass `tickMs` to also refresh on a timer while the screen is focused.
 */
export function useNow(tickMs?: number): Date {
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      const refresh = () => setNow(new Date());
      refresh();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') refresh();
      });
      const interval = tickMs ? setInterval(refresh, tickMs) : undefined;
      return () => {
        subscription.remove();
        clearInterval(interval);
      };
    }, [tickMs]),
  );

  return now;
}
