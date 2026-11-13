import { useState } from 'react';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import type {
  WebViewOpenWindowEvent,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

import { ORIGIN_WHITELIST, USER_AGENT, shouldStartLoad } from '@/utils/webview';
import type { WebViewRef } from '@/utils/webview';

import { styles } from './SiteWebView.styles';

type Props = {
  webViewRef: WebViewRef;
  /** Page to open when the view mounts. Later changes are ignored: a new `source` would reload the page. */
  initialUrl: string;
  /** Filter script run before each page's own scripts. */
  injection: string | undefined;
  onLoadProgress: (event: WebViewProgressEvent) => void;
  onNavigationStateChange: (state: WebViewNavigation) => void;
  onOpenWindow: (event: WebViewOpenWindowEvent) => void;
};

/** In development the page reports how many elements each enabled filter matched. */
function logFilterReport(event: WebViewMessageEvent) {
  // eslint-disable-next-line no-console -- development-only filter report, read from the Metro log
  if (__DEV__) console.log('[filters]', event.nativeEvent.data);
}

/** The WebView that shows a platform's site, with the settings every site needs. */
export function SiteWebView({
  webViewRef,
  initialUrl,
  injection,
  onLoadProgress,
  onNavigationStateChange,
  onOpenWindow,
}: Props) {
  const [uri] = useState(initialUrl);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri }}
      style={styles.webView}
      userAgent={USER_AGENT}
      injectedJavaScriptBeforeContentLoaded={injection}
      onMessage={logFilterReport}
      onLoadProgress={onLoadProgress}
      onNavigationStateChange={onNavigationStateChange}
      originWhitelist={ORIGIN_WHITELIST}
      onShouldStartLoadWithRequest={shouldStartLoad}
      onOpenWindow={onOpenWindow}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      domStorageEnabled
      allowsBackForwardNavigationGestures
      allowsInlineMediaPlayback
      allowsFullscreenVideo
      pullToRefreshEnabled
      setSupportMultipleWindows={false}
      decelerationRate="normal"
    />
  );
}
