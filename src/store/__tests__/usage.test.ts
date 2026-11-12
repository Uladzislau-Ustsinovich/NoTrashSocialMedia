import AsyncStorage from '@react-native-async-storage/async-storage';

import { secondsOn } from '@/utils/usage';

import { createPersistedStore } from '../createPersistedStore';

describe('createPersistedStore', () => {
  beforeEach(() => AsyncStorage.clear());

  it('starts from the initial value, then loads what was saved', async () => {
    await AsyncStorage.setItem('k', JSON.stringify({ a: 1 }));
    const store = createPersistedStore<Record<string, number>>('k', {});

    expect(store.get()).toEqual({});
    await store.hydrate();
    expect(store.get()).toEqual({ a: 1 });
  });

  it('keeps the initial value when the saved data is corrupt', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await AsyncStorage.setItem('k', '{not json');
    const store = createPersistedStore('k', { ok: true });

    await store.hydrate();

    expect(store.get()).toEqual({ ok: true });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('saves every change made after loading', async () => {
    const store = createPersistedStore('k', 0);
    await store.hydrate();
    store.update(() => 5);
    await Promise.resolve();
    expect(await AsyncStorage.getItem('k')).toBe('5');
  });

  it('replays changes made before loading on top of the saved value', async () => {
    await AsyncStorage.setItem('k', JSON.stringify({ saved: 1 }));
    const store = createPersistedStore<Record<string, number>>('k', {});

    store.update((value) => ({ ...value, early: 2 }));
    expect(store.get()).toEqual({ early: 2 });
    expect(JSON.parse((await AsyncStorage.getItem('k')) ?? '')).toEqual({ saved: 1 });

    await store.hydrate();
    await Promise.resolve();
    expect(store.get()).toEqual({ saved: 1, early: 2 });
    expect(JSON.parse((await AsyncStorage.getItem('k')) ?? '')).toEqual({ saved: 1, early: 2 });
  });
});

describe('usage store', () => {
  /** A fresh copy of the store module, so tests do not share its in-memory state. */
  function loadStore() {
    let store!: typeof import('../usage');
    jest.isolateModules(() => {
      store = require('../usage');
    });
    return store;
  }

  beforeEach(() => AsyncStorage.clear());

  it('ignores zero and negative durations', async () => {
    const { addUsage, hydrateUsage } = loadStore();
    await hydrateUsage();
    addUsage('x', 0);
    addUsage('x', -3);
    await Promise.resolve();
    expect(await AsyncStorage.getItem('usage:v1')).toBeNull();
  });

  it('adds time to the given day', async () => {
    const { addUsage, hydrateUsage } = loadStore();
    await hydrateUsage();
    const when = new Date(2026, 4, 2, 9);
    addUsage('x', 40, when);
    addUsage('x', 20, when);
    await Promise.resolve();
    const saved = JSON.parse((await AsyncStorage.getItem('usage:v1')) ?? '{}');
    expect(secondsOn(saved, 'x', when)).toBe(60);
  });

  it('deletes days past the retention window when loading', async () => {
    await AsyncStorage.setItem('usage:v1', JSON.stringify({ '2026-01-01': { x: 5 }, '2026-03-01': { x: 7 } }));
    const { hydrateUsage } = loadStore();
    await hydrateUsage(new Date(2026, 2, 2, 9));
    await Promise.resolve();
    expect(JSON.parse((await AsyncStorage.getItem('usage:v1')) ?? '')).toEqual({ '2026-03-01': { x: 7 } });
  });

  it('erases everything on request', async () => {
    const { addUsage, clearUsage, hydrateUsage } = loadStore();
    await hydrateUsage();
    addUsage('x', 40);
    clearUsage();
    await Promise.resolve();
    expect(await AsyncStorage.getItem('usage:v1')).toBe('{}');
  });
});
