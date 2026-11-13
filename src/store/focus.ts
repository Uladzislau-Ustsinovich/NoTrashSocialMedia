import { useSyncExternalStore } from 'react';

import { EXTENSION_MINUTES, focusFor } from '@/utils/focus';
import type { FocusByPlatform, FocusSettings } from '@/utils/focus';

import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<FocusByPlatform>('focus:v1', {});

/** Loads saved focus settings once at app start. */
export const hydrateFocus = store.hydrate;

export function setFocus(platformId: string, patch: Partial<FocusSettings>): void {
  store.update((all) => ({ ...all, [platformId]: { ...all[platformId], ...patch } }));
}

export function useFocusSettings(platformId: string | undefined): {
  hydrated: boolean;
  settings: FocusSettings;
} {
  const { hydrated, value } = store.useStore();
  return { hydrated, settings: focusFor(value, platformId ?? '') };
}

export function useAllFocusSettings(): FocusByPlatform {
  return store.useStore().value;
}

// Limit extensions last minutes and are deliberately not saved: restarting the app ends them.
let extendedUntil: Readonly<Record<string, number>> = {};
const extensionListeners = new Set<() => void>();

function subscribeToExtensions(listener: () => void) {
  extensionListeners.add(listener);
  return () => {
    extensionListeners.delete(listener);
  };
}

/** Lifts today's limit on a platform for a few minutes. */
export function extendLimit(platformId: string, now = Date.now()): void {
  extendedUntil = { ...extendedUntil, [platformId]: now + EXTENSION_MINUTES * 60_000 };
  extensionListeners.forEach((listener) => listener());
}

/** Timestamp (ms) until which the platform's limit is lifted, or 0. */
export function useExtendedUntil(platformId: string | undefined): number {
  const all = useSyncExternalStore(
    subscribeToExtensions,
    () => extendedUntil,
    () => extendedUntil,
  );
  return all[platformId ?? ''] ?? 0;
}
