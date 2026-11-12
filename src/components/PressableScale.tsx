import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';

type Props = Omit<PressableProps, 'style' | 'children' | 'onPressIn' | 'onPressOut'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. */
  pressedScale?: number;
  children: ReactNode;
};

/** A Pressable that shrinks slightly while held. */
export function PressableScale({ style, pressedScale = 0.96, children, ...rest }: Props) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(pressedScale);

  return (
    <Pressable {...rest} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
