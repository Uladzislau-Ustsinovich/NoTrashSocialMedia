import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;

/** Press feedback: an animated style that shrinks to `pressedScale` while held. Only transform is animated. */
export function usePressScale(pressedScale: number) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return {
    animatedStyle,
    onPressIn: () => {
      scale.set(withSpring(pressedScale, SPRING));
    },
    onPressOut: () => {
      scale.set(withSpring(1, SPRING));
    },
  };
}
