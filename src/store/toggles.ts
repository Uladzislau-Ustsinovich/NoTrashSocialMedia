import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { ToggleOverrides } from '@/utils/toggles';

const STORAGE_KEY = 'toggles:v1';

type State = { hydrated: boolean; overrides: ToggleOverrides };

let state: State = { hydrated: false, overrides: {} };
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

/** Loads saved switches once at app start. A read failure falls back to defaults. */
export async function hydrateToggles(): Promise<void> {
  if (state.hydrated) return;
  let overrides: ToggleOverrides = {};
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) overrides = JSON.parse(raw);
  } catch (error) {
    console.warn('Could not read saved filters, using defaults.', error);
  }
  setState({ hydrated: true, overrides });
}

export function setToggle(id: string, on: boolean): void {
  const overrides = { ...state.overrides, [id]: on };
  setState({ ...state, overrides });
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)).catch((error) => {
    console.warn('Could not save filters.', error);
  });
}

/** Puts the given switches back to their defaults. */
export function resetToggles(ids: string[]): void {
  const overrides = { ...state.overrides };
  for (const id of ids) delete overrides[id];
  setState({ ...state, overrides });
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)).catch((error) => {
    console.warn('Could not save filters.', error);
  });
}

export function useToggleState(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
