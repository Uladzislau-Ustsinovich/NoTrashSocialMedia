import type { ToggleOverrides } from '@/utils/toggles';

import { createPersistedStore } from './createPersistedStore';

const store = createPersistedStore<ToggleOverrides>('toggles:v1', {});

/** Loads saved switches once at app start. */
export const hydrateToggles = store.hydrate;

export function setToggle(id: string, on: boolean): void {
  store.update((overrides) => ({ ...overrides, [id]: on }));
}

/** Puts the given switches back to their defaults. */
export function resetToggles(ids: string[]): void {
  store.update((current) => {
    const overrides = { ...current };
    for (const id of ids) delete overrides[id];
    return overrides;
  });
}

export function useToggleState(): { hydrated: boolean; overrides: ToggleOverrides } {
  const { hydrated, value } = store.useStore();
  return { hydrated, overrides: value };
}
