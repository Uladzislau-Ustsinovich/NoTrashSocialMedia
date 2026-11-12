import type { Platform } from '@/platforms/types';

import { RUNTIME } from './runtime';

export type InjectionConfig = {
  css: string;
  blockRoutes: string[];
  authPaths: string[];
  home: string;
  /** Selectors per enabled toggle, used by the runtime to report how many elements each one matches. */
  selectors: Record<string, string[]>;
  textRules: { id: string; within: string; text: string[] }[];
  clickRules: { paths: string[]; when: string; click: string }[];
  redirects: { path: string; unlessSearch: string; to: string }[];
  debug: boolean;
};

export function buildConfig(
  platform: Platform,
  isEnabled: (toggleId: string) => boolean,
  debug = false,
): InjectionConfig {
  const rules: string[] = [];
  const blockRoutes: string[] = [];
  const selectors: Record<string, string[]> = {};
  const textRules: InjectionConfig['textRules'] = [];
  const clickRules: InjectionConfig['clickRules'] = [];
  const redirects: InjectionConfig['redirects'] = [];

  for (const toggle of platform.toggles) {
    if (!isEnabled(toggle.id)) continue;
    const css = [...(toggle.css ?? [])];
    if (toggle.hideByText?.length) {
      // The runtime marks matching containers with this attribute.
      css.push(`[data-nt-hide~="${toggle.id}"]`);
      for (const rule of toggle.hideByText) textRules.push({ id: toggle.id, ...rule });
    }
    for (const selector of css) {
      rules.push(`${selector}{display:none !important}`);
    }
    if (css.length) selectors[toggle.id] = css;
    clickRules.push(...(toggle.autoClick ?? []));
    redirects.push(...(toggle.redirects ?? []));
    blockRoutes.push(...(toggle.blockRoutes ?? []));
  }

  return {
    css: rules.join('\n'),
    blockRoutes,
    authPaths: platform.authPaths,
    home: platform.homeUrl,
    selectors,
    textRules,
    clickRules,
    redirects,
    debug,
  };
}

/** Script for `injectedJavaScriptBeforeContentLoaded`: installs the runtime and applies the config. */
export function buildInjection(config: InjectionConfig): string {
  return `${RUNTIME}\nwindow.__NT.apply(${JSON.stringify(config)});\ntrue;`;
}

/** Script for `injectJavaScript`: re-applies the config to a page that is already open. */
export function buildUpdate(config: InjectionConfig): string {
  return `window.__NT && window.__NT.apply(${JSON.stringify(config)});\ntrue;`;
}
