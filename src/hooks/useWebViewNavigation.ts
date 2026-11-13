import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview';
import type { WebViewOpenWindowEvent } from 'react-native-webview/lib/WebViewTypes';

import { isWebUrl, navigateScript } from '@/utils/webview';
import type { WebViewRef } from '@/utils/webview';

/**
 * Back/forward state and navigation actions for a WebView, including the Android hardware back
 * button. `active` is false while the WebView is not on screen (behind a gate), so the back
 * button is not captured for a page that is not there.
 */
export function useWebViewNavigation(webViewRef: WebViewRef, active: boolean) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  /** The page last shown, so the site can reopen where the user was after a gate. */
  const [lastUrl, setLastUrl] = useState<string>();

  const onNavigationStateChange = useCallback((state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    if (isWebUrl(state.url)) setLastUrl(state.url);
  }, []);

  const goBack = useCallback(() => webViewRef.current?.goBack(), [webViewRef]);
  const goForward = useCallback(() => webViewRef.current?.goForward(), [webViewRef]);
  const reload = useCallback(() => webViewRef.current?.reload(), [webViewRef]);
  const goTo = useCallback(
    (url: string) => webViewRef.current?.injectJavaScript(navigateScript(url)),
    [webViewRef],
  );

  /** Links that ask for a new window open in this one instead of the system browser. */
  const onOpenWindow = useCallback(
    (event: WebViewOpenWindowEvent) => {
      const target = event.nativeEvent.targetUrl;
      if (isWebUrl(target)) goTo(target);
    },
    [goTo],
  );

  // Android hardware back steps through page history before leaving the screen.
  useEffect(() => {
    if (!active || !canGoBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [active, canGoBack, goBack]);

  return {
    canGoBack,
    canGoForward,
    lastUrl,
    onNavigationStateChange,
    onOpenWindow,
    goBack,
    goForward,
    reload,
    goTo,
  };
}
