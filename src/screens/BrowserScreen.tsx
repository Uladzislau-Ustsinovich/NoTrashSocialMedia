import { Stack, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { BrowserToolbar } from '@/components/BrowserToolbar';
import { LoadProgressBar } from '@/components/LoadProgressBar';
import { useFilterInjection } from '@/hooks/useFilterInjection';
import { useLoadProgress } from '@/hooks/useLoadProgress';
import { usePlatformParam } from '@/hooks/usePlatformParam';
import { useWebViewNavigation } from '@/hooks/useWebViewNavigation';
import { ORIGIN_WHITELIST, USER_AGENT, resolveStartUrl, shouldStartLoad } from '@/utils/webview';

import { styles } from './BrowserScreen.styles';

const SAFE_AREA_EDGES = ['bottom'] as const;

/** In development the page reports how many elements each enabled filter matched. */
function logFilterReport(event: WebViewMessageEvent) {
  if (__DEV__) console.log('[filters]', event.nativeEvent.data);
}

export default function BrowserScreen() {
  const router = useRouter();
  const { platform, url } = usePlatformParam();

  // The explicit `{}` matters: WebView's default type parameter collapses its props to `never`.
  const webViewRef = useRef<WebView<{}>>(null);
  const navigation = useWebViewNavigation(webViewRef);
  const { barStyle, onLoadProgress } = useLoadProgress();
  const { ready, injection } = useFilterInjection(platform, webViewRef);

  if (!platform) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.missingText}>Unknown platform.</Text>
      </View>
    );
  }

  if (!ready) return <View style={styles.container} />;

  const { id, homeUrl } = platform;

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <Stack.Screen options={{ title: platform.name }} />
      <LoadProgressBar barStyle={barStyle} />
      <WebView
        ref={webViewRef}
        source={{ uri: resolveStartUrl(url, homeUrl) }}
        style={styles.webView}
        userAgent={USER_AGENT}
        injectedJavaScriptBeforeContentLoaded={injection}
        onMessage={logFilterReport}
        onLoadProgress={onLoadProgress}
        onNavigationStateChange={navigation.onNavigationStateChange}
        originWhitelist={ORIGIN_WHITELIST}
        onShouldStartLoadWithRequest={shouldStartLoad}
        onOpenWindow={navigation.onOpenWindow}
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
      <BrowserToolbar
        canGoBack={navigation.canGoBack}
        canGoForward={navigation.canGoForward}
        onBack={navigation.goBack}
        onForward={navigation.goForward}
        onReload={navigation.reload}
        onHome={() => navigation.goTo(homeUrl)}
        onOpenFilters={() =>
          router.push({ pathname: '/settings/[platform]', params: { platform: id } })
        }
      />
    </SafeAreaView>
  );
}
