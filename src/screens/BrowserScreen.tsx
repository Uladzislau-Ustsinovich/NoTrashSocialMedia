import { Stack, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { BrowserToolbar } from '@/components/BrowserToolbar';
import { LimitGate } from '@/components/LimitGate';
import { LoadProgressBar } from '@/components/LoadProgressBar';
import { PauseGate } from '@/components/PauseGate';
import { useAccessGate } from '@/hooks/useAccessGate';
import { useFilterInjection } from '@/hooks/useFilterInjection';
import { useLoadProgress } from '@/hooks/useLoadProgress';
import { usePlatformParam } from '@/hooks/usePlatformParam';
import { useUsageTimer } from '@/hooks/useUsageTimer';
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
  const access = useAccessGate(platform?.id);
  const showingSite = ready && access.ready && access.gate === 'open';
  // Time only counts while the site itself is on screen, not a gate or a blank placeholder.
  useUsageTimer(showingSite ? platform?.id : undefined);

  if (!platform) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.missingText}>Unknown platform.</Text>
      </View>
    );
  }

  if (!ready || !access.ready) return <View style={styles.container} />;

  const { id, homeUrl } = platform;
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // The WebView is not mounted behind a gate, so nothing loads or plays until it opens.
  if (access.gate === 'limit') {
    return (
      <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
        <Stack.Screen options={{ title: platform.name }} />
        <LimitGate
          platformName={platform.name}
          limitMinutes={access.settings.dailyLimitMinutes}
          secondsToday={access.secondsToday}
          onLeave={leave}
          onExtend={access.extend}
        />
      </SafeAreaView>
    );
  }

  if (access.gate === 'pause') {
    return (
      <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
        <Stack.Screen options={{ title: platform.name }} />
        <PauseGate
          platformName={platform.name}
          seconds={access.settings.pauseSeconds}
          onDone={access.finishPause}
          onCancel={leave}
        />
      </SafeAreaView>
    );
  }

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
