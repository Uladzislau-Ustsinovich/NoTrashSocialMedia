import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState } from 'react-native';

import { addUsage } from '@/store/usage';
import { countElapsed } from '@/utils/usage';

const FLUSH_INTERVAL_MS = 15_000;
/** Longest gap between flushes still treated as real time; anything longer is a clock jump. */
const MAX_GAP_MS = 2 * FLUSH_INTERVAL_MS;

/**
 * Counts time on a platform while its screen is focused and the app is in the foreground.
 * Time is saved every few seconds and when the screen or app goes away, so little is lost on a kill.
 */
export function useUsageTimer(platformId: string | undefined): void {
  useFocusEffect(
    useCallback(() => {
      if (!platformId) return;

      let countedUntil = Date.now();
      let foreground = AppState.currentState === 'active';

      const flush = () => {
        const now = Date.now();
        if (!foreground) {
          countedUntil = now;
          return;
        }
        const counted = countElapsed(countedUntil, now, MAX_GAP_MS);
        countedUntil = counted.countedUntil;
        if (counted.seconds > 0) addUsage(platformId, counted.seconds);
      };

      const interval = setInterval(flush, FLUSH_INTERVAL_MS);
      const subscription = AppState.addEventListener('change', (next) => {
        flush();
        foreground = next === 'active';
        countedUntil = Date.now();
      });

      return () => {
        flush();
        clearInterval(interval);
        subscription.remove();
      };
    }, [platformId]),
  );
}
