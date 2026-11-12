import { useEffect, useMemo } from 'react';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';

import { buildConfig, buildInjection, buildUpdate } from '@/engine/buildInjection';
import type { Platform } from '@/platforms';
import { useFocusSettings } from '@/store/focus';
import { useToggleState } from '@/store/toggles';
import { isToggleOn } from '@/utils/toggles';

/**
 * The filter script for a platform, built from the saved switches.
 *
 * `injection` goes to the WebView for every new page. When a switch changes, the hook also
 * re-applies the config to the page that is already open. `ready` is false until the saved
 * switches have loaded; mounting the WebView earlier would load the first page with defaults.
 */
export function useFilterInjection(
  platform: Platform | undefined,
  webViewRef: RefObject<WebView<{}> | null>,
) {
  const { hydrated, overrides } = useToggleState();
  const { grayscale } = useFocusSettings(platform?.id).settings;

  const config = useMemo(() => {
    if (!platform) return null;
    const enabled = new Set(
      platform.toggles.filter((toggle) => isToggleOn(toggle, overrides)).map((toggle) => toggle.id),
    );
    return buildConfig(platform, (id) => enabled.has(id), __DEV__, { grayscale });
  }, [platform, overrides, grayscale]);

  const injection = useMemo(() => (config ? buildInjection(config) : undefined), [config]);

  useEffect(() => {
    if (config) webViewRef.current?.injectJavaScript(buildUpdate(config));
  }, [config, webViewRef]);

  return { ready: hydrated, injection };
}
