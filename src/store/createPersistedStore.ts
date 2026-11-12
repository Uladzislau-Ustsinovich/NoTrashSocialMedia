import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

type Snapshot<T> = { hydrated: boolean; value: T };

/**
 * A small store kept in memory and mirrored to AsyncStorage under `key`.
 *
 * `hydrate` loads the saved value once at app start; a read failure keeps `initial`.
 * `set` updates subscribers immediately and saves in the background.
 */
export function createPersistedStore<T>(key: string, initial: T) {
  let snapshot: Snapshot<T> = { hydrated: false, value: initial };
  const listeners = new Set<() => void>();

  function publish(next: Snapshot<T>) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  const getSnapshot = () => snapshot;

  return {
    async hydrate(): Promise<void> {
      if (snapshot.hydrated) return;
      let value = initial;
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) value = JSON.parse(raw) as T;
      } catch (error) {
        console.warn(`Could not read "${key}", using defaults.`, error);
      }
      publish({ hydrated: true, value });
    },

    get: (): T => snapshot.value,

    set(value: T): void {
      publish({ ...snapshot, value });
      AsyncStorage.setItem(key, JSON.stringify(value)).catch((error) => {
        console.warn(`Could not save "${key}".`, error);
      });
    },

    useStore: (): Snapshot<T> => useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
  };
}
