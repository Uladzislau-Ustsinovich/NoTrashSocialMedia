import { useState } from 'react';

import { extendLimit, useExtendedUntil, useFocusSettings } from '@/store/focus';
import { useUsage } from '@/store/usage';
import { isOverLimit } from '@/utils/focus';
import { secondsOn } from '@/utils/usage';

import { useNow } from './useNow';

/** What stands between the user and the platform: nothing, the pause, or today's limit. */
type Gate = 'open' | 'pause' | 'limit';

/** How often the limit is re-checked against the clock: extensions and midnight end on time, not on a usage update. */
const CLOCK_TICK_MS = 5000;

/**
 * Decides whether a platform may be shown. The limit wins over the pause. `ready` is false until
 * saved settings and usage have loaded, so the page never flashes before a gate appears.
 */
export function useAccessGate(platformId: string | undefined) {
  const { hydrated: focusReady, settings } = useFocusSettings(platformId);
  const { hydrated: usageReady, log } = useUsage();
  const extendedUntil = useExtendedUntil(platformId);
  const ready = focusReady && usageReady;
  const now = useNow(CLOCK_TICK_MS);
  /** The platform whose entry pause is over: it ran, or the site opened without one. */
  const [enteredId, setEnteredId] = useState<string>();

  const secondsToday = platformId ? secondsOn(log, platformId, now) : 0;

  let gate: Gate = 'open';
  if (isOverLimit(settings, secondsToday, extendedUntil, now.getTime())) gate = 'limit';
  else if (settings.pauseSeconds > 0 && enteredId !== platformId) gate = 'pause';

  // The pause guards entry only. Once the site has opened, switching the pause on in the filters
  // screen must not close the page that is already showing. (State adjusted during render.)
  if (ready && gate === 'open' && platformId && enteredId !== platformId) setEnteredId(platformId);

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
