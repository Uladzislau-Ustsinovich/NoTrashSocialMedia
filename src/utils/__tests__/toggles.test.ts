import type { Platform } from '@/platforms';
import { countActiveToggles, groupToggles, hasOverrides, isToggleOn } from '@/utils/toggles';

const platform: Platform = {
  id: 'x',
  name: 'Test',
  tagline: '',
  monogram: 'T',
  tint: '#fff',
  homeUrl: 'https://example.com/',
  authPaths: [],
  toggles: [
    { id: 'a', label: 'A', group: 'Navigation', defaultOn: true },
    { id: 'b', label: 'B', group: 'Feed', defaultOn: false },
    { id: 'c', label: 'C', group: 'Feed', defaultOn: true },
  ],
};

describe('toggles', () => {
  it('follows the default until the user overrides it', () => {
    const [a, b] = platform.toggles;
    expect(isToggleOn(a, {})).toBe(true);
    expect(isToggleOn(a, { a: false })).toBe(false);
    expect(isToggleOn(b, { b: true })).toBe(true);
  });

  it('counts active switches', () => {
    expect(countActiveToggles(platform, {})).toBe(2);
    expect(countActiveToggles(platform, { a: false, b: true })).toBe(2);
    expect(countActiveToggles(platform, { b: true })).toBe(3);
  });

  it('reports overrides only for this platform', () => {
    expect(hasOverrides(platform, {})).toBe(false);
    expect(hasOverrides(platform, { other: true })).toBe(false);
    expect(hasOverrides(platform, { c: true })).toBe(true);
  });

  it('groups in display order and drops empty groups', () => {
    expect(groupToggles(platform).map((s) => [s.group, s.toggles.map((t) => t.id)])).toEqual([
      ['Feed', ['b', 'c']],
      ['Navigation', ['a']],
    ]);
    expect(groupToggles({ ...platform, toggles: [platform.toggles[0]] })).toHaveLength(1);
  });
});
