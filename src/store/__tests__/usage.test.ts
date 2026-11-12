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

  it('saves every change', async () => {
    const store = createPersistedStore('k', 0);
    store.set(5);
    await Promise.resolve();
    expect(await AsyncStorage.getItem('k')).toBe('5');
  });
});

describe('usage store', () => {
  it('ignores zero and negative durations', async () => {
    await AsyncStorage.clear();
    const { addUsage } = require('../usage') as typeof import('../usage');
    addUsage('x', 0);
    addUsage('x', -3);
    await Promise.resolve();
    expect(await AsyncStorage.getItem('usage:v1')).toBeNull();
  });

  it('adds time to the given day', async () => {
    await AsyncStorage.clear();
    const { addUsage } = require('../usage') as typeof import('../usage');
    const when = new Date(2026, 4, 2, 9);
    addUsage('x', 40, when);
    addUsage('x', 20, when);
    await Promise.resolve();
    const saved = JSON.parse((await AsyncStorage.getItem('usage:v1')) ?? '{}');
    expect(secondsOn(saved, 'x', when)).toBe(60);
  });
});
