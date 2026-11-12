import type { ToggleOverrides } from '@/utils/toggles';

import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<ToggleOverrides>('toggles:v1', {});

/** Loads saved switches once at app start. */
export const hydrateToggles = store.hydrate;

export function setToggle(id: string, on: boolean): void {
  store.set({ ...store.get(), [id]: on });
}

/** Puts the given switches back to their defaults. */
export function resetToggles(ids: string[]): void {
  const overrides = { ...store.get() };
  for (const id of ids) delete overrides[id];
  store.set(overrides);
}

export function useToggleState(): { hydrated: boolean; overrides: ToggleOverrides } {
  const { hydrated, value } = store.useStore();
  return { hydrated, overrides: value };
}
