import { useEffect, useState } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { finishWelcome } from '@/store/welcome';

/** When the overlay starts to leave; the home screen begins animating in at the same moment. */
const HOLD_MS = 1500;
const REDUCED_MOTION_HOLD_MS = 600;
const EXIT_MS = 450;
const EXIT = { duration: EXIT_MS, easing: Easing.out(Easing.quad) } as const;

/** Drives the hello overlay: holds, fades out while scaling up, then reports it can be unmounted. */
export function useWelcomeAnimation() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const hold = reducedMotion ? REDUCED_MOTION_HOLD_MS : HOLD_MS;
    opacity.value = withDelay(hold, withTiming(0, EXIT));
    if (!reducedMotion) scale.value = withDelay(hold, withTiming(1.08, EXIT));

    const reveal = setTimeout(finishWelcome, hold);
    const remove = setTimeout(() => setVisible(false), hold + EXIT_MS);
    return () => {
      clearTimeout(reveal);
      clearTimeout(remove);
    };
  }, [opacity, scale, reducedMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { visible, overlayStyle, contentStyle };
}
