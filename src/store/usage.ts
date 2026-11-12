import { addSeconds } from '@/utils/usage';
import type { UsageLog } from '@/utils/usage';

import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<UsageLog>('usage:v1', {});

/** Loads the saved usage log once at app start. */
export const hydrateUsage = store.hydrate;

/** Records time spent on a platform. Stays on the device. */
export function addUsage(platformId: string, seconds: number, now = new Date()): void {
  if (seconds <= 0) return;
  store.set(addSeconds(store.get(), platformId, seconds, now));
}

export function useUsageLog(): UsageLog {
  return store.useStore().value;
}
