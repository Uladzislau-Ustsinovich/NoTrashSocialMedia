import { useEffect, useState } from 'react';

import { extendLimit, useExtendedUntil, useFocusSettings } from '@/store/focus';
import { useUsage } from '@/store/usage';
import { isOverLimit } from '@/utils/focus';
import { secondsOn } from '@/utils/usage';

/** What stands between the user and the platform: nothing, the pause, or today's limit. */
export type Gate = 'open' | 'pause' | 'limit';

/**
 * Decides whether a platform may be shown. The limit wins over the pause. `ready` is false until
 * saved settings and usage have loaded, so the page never flashes before a gate appears.
 */
export function useAccessGate(platformId: string | undefined) {
  const { hydrated: focusReady, settings } = useFocusSettings(platformId);
  const { hydrated: usageReady, log } = useUsage();
  const extendedUntil = useExtendedUntil(platformId);
  const [pauseDone, setPauseDone] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // An extension ends on the clock, not on a usage update, so re-check when it runs out.
  useEffect(() => {
    const remaining = extendedUntil - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining + 50);
    return () => clearTimeout(timer);
  }, [extendedUntil]);

  const current = Math.max(now, Date.now());
  const secondsToday = platformId ? secondsOn(log, platformId, new Date(current)) : 0;

  let gate: Gate = 'open';
  if (isOverLimit(settings, secondsToday, extendedUntil, current)) gate = 'limit';
  else if (settings.pauseSeconds > 0 && !pauseDone) gate = 'pause';

  return {
    ready: focusReady && usageReady,
    gate,
    settings,
    secondsToday,
    finishPause: () => setPauseDone(true),
    extend: () => {
      if (platformId) extendLimit(platformId);
    },
  };
}
