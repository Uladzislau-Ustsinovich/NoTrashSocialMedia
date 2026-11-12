import type { Platform } from '@/platforms';

import { GRAYSCALE_RULE, buildConfig, buildInjection, buildUpdate } from '../buildInjection';

const platform: Platform = {
  id: 'instagram',
  name: 'Test',
  tagline: '',
  monogram: 'T',
  tint: '#fff',
  homeUrl: 'https://example.com/',
  authPaths: ['/login'],
  toggles: [
    { id: 'css', label: '', group: 'Feed', defaultOn: true, css: ['.a', '.b'], blockRoutes: ['/reels'] },
    { id: 'text', label: '', group: 'Feed', defaultOn: true, hideByText: [{ within: 'article', text: ['Ad'] }] },
    {
      id: 'nav',
      label: '',
      group: 'Feed',
      defaultOn: true,
      redirects: [{ path: '/', unlessSearch: 'v=1', to: '/?v=1' }],
      autoClick: [{ paths: ['/home'], when: '.w', click: '.c' }],
    },
  ],
};

describe('buildConfig', () => {
  it('includes only enabled switches', () => {
    const config = buildConfig(platform, (id) => id === 'css');

    expect(config.css).toBe('.a{display:none !important}\n.b{display:none !important}');
    expect(config.blockRoutes).toEqual(['/reels']);
    expect(config.textRules).toEqual([]);
    expect(config.redirects).toEqual([]);
    expect(config.clickRules).toEqual([]);
    expect(config.selectors).toEqual({ css: ['.a', '.b'] });
  });

  it('turns text rules into a marker selector plus a runtime rule', () => {
    const config = buildConfig(platform, (id) => id === 'text');

    expect(config.css).toBe('[data-nt-hide~="text"]{display:none !important}');
    expect(config.textRules).toEqual([{ id: 'text', within: 'article', text: ['Ad'] }]);
  });

  it('carries redirects, click rules, auth paths and home through', () => {
    const config = buildConfig(platform, () => true, true);

    expect(config.redirects).toEqual([{ path: '/', unlessSearch: 'v=1', to: '/?v=1' }]);
    expect(config.clickRules).toEqual([{ paths: ['/home'], when: '.w', click: '.c' }]);
    expect(config.authPaths).toEqual(['/login']);
    expect(config.home).toBe('https://example.com/');
    expect(config.hosts).toEqual(['example.com']);
    expect(buildConfig({ ...platform, extraHosts: ['m.example.com'] }, () => true).hosts).toEqual([
      'example.com',
      'm.example.com',
    ]);
    expect(config.debug).toBe(true);
  });

  it('adds the grayscale rule after the filter rules when asked', () => {
    expect(buildConfig(platform, () => false, false, { grayscale: true }).css).toBe(GRAYSCALE_RULE);
    expect(buildConfig(platform, (id) => id === 'css', false, { grayscale: true }).css.endsWith(GRAYSCALE_RULE)).toBe(true);
    expect(buildConfig(platform, () => true).css).not.toContain('grayscale');
  });

  it('produces nothing when every switch is off', () => {
    const config = buildConfig(platform, () => false);
    expect(config.css).toBe('');
    expect(config.blockRoutes).toEqual([]);
  });
});

describe('scripts', () => {
  const config = buildConfig(platform, () => true);

  it('end with `true;` so the WebView does not warn about the return value', () => {
    expect(buildInjection(config).trimEnd().endsWith('true;')).toBe(true);
    expect(buildUpdate(config).trimEnd().endsWith('true;')).toBe(true);
  });

  it('the update script is safe when the runtime is missing', () => {
    expect(buildUpdate(config)).toContain('window.__NT && window.__NT.apply(');
  });
});
