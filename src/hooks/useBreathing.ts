import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** A slow grow-and-shrink loop, like a breath. Still when the user prefers reduced motion. */
export function useBreathing() {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withRepeat(
      withTiming(1.14, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [scale, reducedMotion]);

  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}
