import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { WebViewProgressEvent } from 'react-native-webview/lib/WebViewTypes';

/** Page-load bar: grows from the left with the load, then fades out. */
export function useLoadProgress() {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  const barStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleX: progress.value }],
  }));

  const onLoadProgress = useCallback(
    (event: WebViewProgressEvent) => {
      const value = event.nativeEvent.progress;
      const done = value >= 1;
      progress.value = withTiming(Math.max(value, 0.08), { duration: 180 });
      opacity.value = withTiming(done ? 0 : 1, { duration: done ? 350 : 120 });
    },
    [progress, opacity],
  );

  return { barStyle, onLoadProgress };
}
