import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

type Snapshot<T> = { hydrated: boolean; value: T };

/**
 * A small store kept in memory and mirrored to AsyncStorage under `key`.
 *
 * `hydrate` loads the saved value once at app start; a read failure keeps `initial`.
 * `update` changes the value for subscribers immediately and saves in the background.
 */
export function createPersistedStore<T>(key: string, initial: T) {
  let snapshot: Snapshot<T> = { hydrated: false, value: initial };
  const listeners = new Set<() => void>();
  /** Updates made before the saved value has loaded; replayed on top of it so neither is lost. */
  let pending: ((current: T) => T)[] = [];

  function publish(next: Snapshot<T>) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function save(value: T) {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((error) => {
      console.warn(`Could not save "${key}".`, error);
    });
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
      const replay = pending;
      pending = [];
      for (const update of replay) value = update(value);
      publish({ hydrated: true, value });
      if (replay.length > 0) save(value);
    },

    get: (): T => snapshot.value,

    /** Applies `change` to the current value. Subscribers see it at once; saving happens in the background. */
    update(change: (current: T) => T): void {
      publish({ ...snapshot, value: change(snapshot.value) });
      if (snapshot.hydrated) save(snapshot.value);
      else pending.push(change);
    },

    useStore: (): Snapshot<T> => useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
  };
}
