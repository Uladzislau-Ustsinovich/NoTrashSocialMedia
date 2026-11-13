import vm from 'node:vm';

import type { InjectionConfig } from '@/engine/buildInjection';
import { RUNTIME } from '@/engine/runtime';

/** A page stub with just enough DOM for the runtime: one style element, history and location. */
function createPage(pathname: string, search = '', hostname = 'site.test') {
  const style = { id: '', textContent: '' };
  let styleAttached = false;
  const attributes: Record<string, string> = {};
  const replaced: string[] = [];

  const location = {
    hostname,
    pathname,
    search,
    href: `https://site.test${pathname}${search}`,
    replace: (url: string) => replaced.push(url),
  };
  const document = {
    head: { appendChild: () => (styleAttached = true) },
    documentElement: {
      appendChild: () => (styleAttached = true),
      setAttribute: (name: string, value: string) => (attributes[name] = value),
    },
    getElementById: () => (styleAttached ? style : null),
    createElement: () => style,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => undefined,
  };
  const session: Record<string, string> = {};
  const history = { pushState: () => undefined, replaceState: () => undefined };
  const window: Record<string, unknown> = { addEventListener: () => undefined };

  const sandbox = {
    window,
    document,
    location,
    history,
    sessionStorage: {
      getItem: (key: string) => session[key] ?? null,
      setItem: (key: string, value: string) => (session[key] = value),
    },
    MutationObserver: class {
      observe() {}
    },
    setTimeout: (fn: () => void) => fn(),
    clearTimeout: () => undefined,
    Date,
    Number,
    String,
    JSON,
  };
  vm.createContext(sandbox);
  vm.runInContext(RUNTIME, sandbox);

  const runtime = window.__NT as { apply: (config: InjectionConfig) => void };
  return { runtime, style, attributes, replaced, location, history };
}

const baseConfig: InjectionConfig = {
  css: '.reels{display:none !important}',
  blockRoutes: ['/reels'],
  authPaths: ['/accounts'],
  hosts: ['site.test'],
  home: 'https://site.test/',
  selectors: {},
  textRules: [],
  clickRules: [],
  redirects: [],
  debug: false,
};

describe('runtime', () => {
  it('applies the stylesheet and records the path on an ordinary page', () => {
    const page = createPage('/someone/');
    page.runtime.apply(baseConfig);

    expect(page.style.textContent).toBe(baseConfig.css);
    expect(page.attributes['data-nt-path']).toBe('/someone/');
    expect(page.replaced).toEqual([]);
  });

  it.each(['/reels', '/reels/', '/reels/abc'])('sends the blocked route %s home', (path) => {
    const page = createPage(path);
    page.runtime.apply(baseConfig);
    expect(page.replaced).toEqual(['https://site.test/']);
  });

  it.each(['/reelsfoo', '/user/reel/123/'])('does not block the look-alike path %s', (path) => {
    const page = createPage(path);
    page.runtime.apply(baseConfig);
    expect(page.replaced).toEqual([]);
  });

  it('leaves login pages alone: no styles, no blocking, no redirect', () => {
    const page = createPage('/accounts/login/');
    page.runtime.apply({
      ...baseConfig,
      blockRoutes: ['/accounts'],
      redirects: [{ path: '/accounts/login/', unlessSearch: 'v=1', to: '/elsewhere' }],
    });

    expect(page.style.textContent).toBe('');
    expect(page.replaced).toEqual([]);
  });

  it('does nothing on another site reached through a link', () => {
    const page = createPage('/reels/', '', 'elsewhere.test');
    page.runtime.apply({
      ...baseConfig,
      redirects: [{ path: '/reels/', unlessSearch: 'v=1', to: '/elsewhere' }],
    });

    expect(page.style.textContent).toBe('');
    expect(page.replaced).toEqual([]);
  });

  it('redirects an exact path once, and not when the query already matches', () => {
    const redirects = [{ path: '/', unlessSearch: 'variant=following', to: '/?variant=following' }];

    const home = createPage('/');
    home.runtime.apply({ ...baseConfig, redirects });
    home.runtime.apply({ ...baseConfig, redirects });
    expect(home.replaced).toEqual(['/?variant=following']);

    const already = createPage('/', '?variant=following');
    already.runtime.apply({ ...baseConfig, redirects });
    expect(already.replaced).toEqual([]);
  });

  it('re-checks after in-page navigation through the history API', () => {
    const page = createPage('/someone/');
    page.runtime.apply(baseConfig);

    page.location.pathname = '/reels/';
    page.history.pushState();
    expect(page.replaced).toEqual(['https://site.test/']);
  });

  it('removes the styles when a switch is turned off on the open page', () => {
    const page = createPage('/someone/');
    page.runtime.apply(baseConfig);
    page.runtime.apply({ ...baseConfig, css: '' });
    expect(page.style.textContent).toBe('');
  });
});
