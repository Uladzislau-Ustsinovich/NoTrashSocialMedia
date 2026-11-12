import { useEffect, useState } from 'react';

import { extendLimit, useExtendedUntil, useFocusSettings } from '@/store/focus';
import { useUsage } from '@/store/usage';
import { isOverLimit } from '@/utils/focus';
import { secondsOn } from '@/utils/usage';

import { useNow } from './useNow';

/** What stands between the user and the platform: nothing, the pause, or today's limit. */
type Gate = 'open' | 'pause' | 'limit';

/**
 * Decides whether a platform may be shown. The limit wins over the pause. `ready` is false until
 * saved settings and usage have loaded, so the page never flashes before a gate appears.
 */
export function useAccessGate(platformId: string | undefined) {
  const { hydrated: focusReady, settings } = useFocusSettings(platformId);
  const { hydrated: usageReady, log } = useUsage();
  const extendedUntil = useExtendedUntil(platformId);
  const ready = focusReady && usageReady;
  // Refreshes on focus and when the app returns, so a limit screen left open overnight clears.
  const refreshedAt = useNow();
  const [, setTick] = useState(0);
  /** The platform whose entry pause is over: it ran, or the site opened without one. */
  const [enteredId, setEnteredId] = useState<string>();

  // An extension ends on the clock, not on a usage update, so re-check when it runs out.
  useEffect(() => {
    const remaining = extendedUntil - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setTick((tick) => tick + 1), remaining + 50);
    return () => clearTimeout(timer);
  }, [extendedUntil]);

  const now = Math.max(refreshedAt.getTime(), Date.now());
  const secondsToday = platformId ? secondsOn(log, platformId, new Date(now)) : 0;

  let gate: Gate = 'open';
  if (isOverLimit(settings, secondsToday, extendedUntil, now)) gate = 'limit';
  else if (settings.pauseSeconds > 0 && enteredId !== platformId) gate = 'pause';

  // The pause guards entry only. Once the site has opened, switching the pause on in the filters
  // screen must not close the page that is already showing.
  useEffect(() => {
    if (ready && gate === 'open' && platformId) setEnteredId(platformId);
  }, [ready, gate, platformId]);

  return {
    ready,
    gate,
    settings,
    secondsToday,
    finishPause: () => setEnteredId(platformId),
    extend: () => {
      if (!platformId) return;
      extendLimit(platformId);
      // Asking for more minutes is already a deliberate choice; do not spend them on the pause.
      setEnteredId(platformId);
    },
  };
}
