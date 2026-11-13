import { Stack, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WebView } from 'react-native-webview';

import { BrowserToolbar } from '@/components/BrowserToolbar';
import { LimitGate } from '@/components/LimitGate';
import { LoadProgressBar } from '@/components/LoadProgressBar';
import { PauseGate } from '@/components/PauseGate';
import { SiteWebView } from '@/components/SiteWebView';
import { useAccessGate } from '@/hooks/useAccessGate';
import { useFilterInjection } from '@/hooks/useFilterInjection';
import { useLoadProgress } from '@/hooks/useLoadProgress';
import { usePlatformParam } from '@/hooks/usePlatformParam';
import { useUsageTimer } from '@/hooks/useUsageTimer';
import { useWebViewNavigation } from '@/hooks/useWebViewNavigation';
import { resolveStartUrl } from '@/utils/webview';
import type { WebViewRef } from '@/utils/webview';

import { styles } from './BrowserScreen.styles';

const SAFE_AREA_EDGES = ['bottom'] as const;

export default function BrowserScreen() {
  const router = useRouter();
  const { platform, url } = usePlatformParam();

  const webViewRef: WebViewRef = useRef<WebView<object>>(null);
  const { barStyle, onLoadProgress } = useLoadProgress();
  const { ready, injection } = useFilterInjection(platform, webViewRef);
  const access = useAccessGate(platform?.id);
  const showingSite = ready && access.ready && access.gate === 'open';
  const navigation = useWebViewNavigation(webViewRef, showingSite);

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
      {/* A gate unmounts this view; on the way back it reopens the page the user was on. */}
      <SiteWebView
        webViewRef={webViewRef}
        initialUrl={resolveStartUrl(navigation.lastUrl ?? url, homeUrl)}
        injection={injection}
        onLoadProgress={onLoadProgress}
        onNavigationStateChange={navigation.onNavigationStateChange}
        onOpenWindow={navigation.onOpenWindow}
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
