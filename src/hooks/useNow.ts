import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time, refreshed whenever the screen regains focus or the app returns to the
 * foreground, so anything that depends on "today" is right after the app sat open overnight.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') setNow(new Date());
      });
      return () => subscription.remove();
    }, []),
  );

  return now;
}
