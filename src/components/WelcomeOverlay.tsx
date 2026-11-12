import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { finishWelcome } from '@/store/welcome';
import { colors } from '@/theme';

const WORD = 'Hello.';
const LETTER_STAGGER = 70;
/** When the overlay starts to leave; the home screen begins animating in at the same moment. */
const HOLD_MS = 1500;
const EXIT_MS = 450;

/** Greets the user once per app launch, then fades away to reveal the home screen. */
export function WelcomeOverlay() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const hold = reducedMotion ? 600 : HOLD_MS;
    opacity.value = withDelay(hold, withTiming(0, { duration: EXIT_MS, easing: Easing.out(Easing.quad) }));
    if (!reducedMotion) {
      scale.value = withDelay(hold, withTiming(1.08, { duration: EXIT_MS, easing: Easing.out(Easing.quad) }));
    }
    const reveal = setTimeout(finishWelcome, hold);
    const remove = setTimeout(() => setVisible(false), hold + EXIT_MS);
    return () => {
      clearTimeout(reveal);
      clearTimeout(remove);
    };
  }, [opacity, scale, reducedMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!visible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.word} accessible accessibilityLabel="Hello">
          {WORD.split('').map((letter, index) => (
            <Animated.Text
              key={index}
              entering={FadeInDown.delay(150 + index * LETTER_STAGGER)
                .duration(520)
                .easing(Easing.out(Easing.cubic))}
              style={[styles.letter, letter === '.' ? styles.dot : null]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
        <Animated.View entering={FadeIn.delay(150 + WORD.length * LETTER_STAGGER + 200).duration(500)}>
          <Text style={styles.tagline}>Your feeds, minus the bait.</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 10,
  },
  word: {
    flexDirection: 'row',
  },
  letter: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  dot: {
    color: colors.accent,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 17,
  },
});
