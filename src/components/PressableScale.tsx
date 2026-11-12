import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. */
  pressedScale?: number;
  children: ReactNode;
};

/** A Pressable that shrinks slightly while held. Only transform is animated. */
export function PressableScale({ style, pressedScale = 0.96, children, disabled, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(pressedScale, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
