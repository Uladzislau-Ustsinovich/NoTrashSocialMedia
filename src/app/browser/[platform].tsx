import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform as RNPlatform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

import { PressableScale } from '@/components/PressableScale';
import { buildConfig, buildInjection, buildUpdate } from '@/engine/buildInjection';
import { getPlatform } from '@/platforms';
import { isToggleOn, useToggleState } from '@/store/toggles';
import { colors } from '@/theme';

/**
 * Sites treat embedded browsers differently from real ones (Google refuses sign-in
 * when the user agent carries the Android "wv" marker), so present as the stock
 * mobile browser of each OS.
 */
const USER_AGENT = RNPlatform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
});

/**
 * Send every URL to `shouldStartLoad`. With the default whitelist, react-native-webview hands
 * non-http URLs straight to the OS, and X uses that to escape embedded browsers by redirecting
 * to `x-safari-https://…`, which launches Safari.
 */
const ORIGIN_WHITELIST = ['*'];
const SAFE_AREA_EDGES = ['bottom'] as const;

/** Only web pages load; app deep links (instagram://, intent://) would leave the app. */
function shouldStartLoad(request: ShouldStartLoadRequest): boolean {
  return /^(https?:|about:)/i.test(request.url);
}

/** In development the page reports how many elements each enabled filter matched. */
function handleMessage(event: WebViewMessageEvent) {
  if (__DEV__) console.log('[filters]', event.nativeEvent.data);
}

export default function BrowserScreen() {
  const router = useRouter();
  const { platform: platformId, url } = useLocalSearchParams<{ platform: string; url?: string }>();
  const platform = getPlatform(platformId);

  // The explicit `{}` matters: WebView's default type parameter collapses its props to `never`.
  const webViewRef = useRef<WebView<{}>>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Page-load bar: grows from the left with the load, then fades out.
  const progress = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
    transform: [{ scaleX: progress.value }],
  }));
  const handleLoadProgress = useCallback(
    (event: WebViewProgressEvent) => {
      const value = event.nativeEvent.progress;
      progress.value = withTiming(Math.max(value, 0.08), { duration: 180 });
      progressOpacity.value = withTiming(value >= 1 ? 0 : 1, { duration: value >= 1 ? 350 : 120 });
    },
    [progress, progressOpacity],
  );

  const { hydrated, overrides } = useToggleState();
  const config = useMemo(
    () =>
      platform
        ? buildConfig(platform, (id) => {
            const toggle = platform.toggles.find((t) => t.id === id);
            return toggle ? isToggleOn(toggle, overrides) : false;
          }, __DEV__)
        : null,
    [platform, overrides],
  );
  const injection = useMemo(() => (config ? buildInjection(config) : undefined), [config]);

  // Apply switch changes to the page that is already open; new pages get them from `injection`.
  useEffect(() => {
    if (config) webViewRef.current?.injectJavaScript(buildUpdate(config));
  }, [config]);

  const handleNavigationStateChange = useCallback((state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
  }, []);

  // Android hardware back steps through page history before leaving the screen.
  useEffect(() => {
    if (!canGoBack) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      webViewRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  if (!platform) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.missingText}>Unknown platform.</Text>
      </View>
    );
  }

  // Wait for saved switches, otherwise the first page would load with the defaults.
  if (!hydrated) return <View style={styles.container} />;

  const homeUrl = platform.homeUrl;
  const currentId = platform.id;
  // A `url` param opens a specific page, but only on the platform's own site.
  const startUrl = url && new URL(url).host === new URL(homeUrl).host ? url : homeUrl;
  const openFilters = () =>
    router.push({ pathname: '/settings/[platform]', params: { platform: currentId } });

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <Stack.Screen options={{ title: platform.name }} />
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: startUrl }}
        style={styles.webView}
        userAgent={USER_AGENT}
        injectedJavaScriptBeforeContentLoaded={injection}
        onMessage={handleMessage}
        onLoadProgress={handleLoadProgress}
        onNavigationStateChange={handleNavigationStateChange}
        originWhitelist={ORIGIN_WHITELIST}
        onShouldStartLoadWithRequest={shouldStartLoad}
        onOpenWindow={(event) => {
          const target = event.nativeEvent.targetUrl;
          if (/^https?:/i.test(target)) {
            webViewRef.current?.injectJavaScript(
              `window.location.href = ${JSON.stringify(target)}; true;`,
            );
          }
        }}
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
      <View style={styles.toolbar}>
        <ToolbarButton
          icon="chevron-back"
          label="Back"
          disabled={!canGoBack}
          onPress={() => webViewRef.current?.goBack()}
        />
        <ToolbarButton
          icon="chevron-forward"
          label="Forward"
          disabled={!canGoForward}
          onPress={() => webViewRef.current?.goForward()}
        />
        <ToolbarButton icon="refresh" label="Reload" onPress={() => webViewRef.current?.reload()} />
        <ToolbarButton
          icon="home-outline"
          label="Home"
          onPress={() =>
            webViewRef.current?.injectJavaScript(
              `window.location.href = ${JSON.stringify(homeUrl)}; true;`,
            )
          }
        />
        <ToolbarButton icon="options-outline" label="Filters" highlighted onPress={openFilters} />
      </View>
    </SafeAreaView>
  );
}

type ToolbarButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  highlighted?: boolean;
  onPress: () => void;
};

function ToolbarButton({ icon, label, disabled = false, highlighted = false, onPress }: ToolbarButtonProps) {
  const tint = disabled ? colors.disabled : highlighted ? colors.accent : colors.text;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      pressedScale={0.82}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={styles.button}
    >
      <Ionicons name={icon} size={23} color={tint} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.accent,
    transformOrigin: 'left',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 2,
  },
  button: {
    width: 52,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
