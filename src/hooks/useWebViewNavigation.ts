import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { BackHandler } from 'react-native';
import type { WebView, WebViewNavigation } from 'react-native-webview';
import type { WebViewOpenWindowEvent } from 'react-native-webview/lib/WebViewTypes';

import { isWebUrl, navigateScript } from '@/utils/webview';

/** Back/forward state and navigation actions for a WebView, including the Android hardware back button. */
export function useWebViewNavigation(webViewRef: RefObject<WebView<{}> | null>) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const onNavigationStateChange = useCallback((state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
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
    if (!canGoBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack, goBack]);

  return { canGoBack, canGoForward, onNavigationStateChange, onOpenWindow, goBack, goForward, reload, goTo };
}
