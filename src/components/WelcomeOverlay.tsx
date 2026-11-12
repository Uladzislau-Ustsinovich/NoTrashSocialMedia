import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';

import { useWelcomeAnimation } from '@/hooks/useWelcomeAnimation';

import { styles } from './WelcomeOverlay.styles';

const LETTERS = 'Hello.'.split('');
const START_DELAY = 150;
const LETTER_STAGGER = 70;

const letterEntering = (index: number) =>
  FadeInDown.delay(START_DELAY + index * LETTER_STAGGER)
    .duration(520)
    .easing(Easing.out(Easing.cubic));
const taglineEntering = FadeIn.delay(START_DELAY + LETTERS.length * LETTER_STAGGER + 200).duration(500);

/** Greets the user once per app launch, then fades away to reveal the home screen. */
export function WelcomeOverlay() {
  const { visible, overlayStyle, contentStyle } = useWelcomeAnimation();

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.word} accessible accessibilityLabel="Hello">
          {LETTERS.map((letter, index) => (
            <Animated.Text
              key={index}
              entering={letterEntering(index)}
              style={[styles.letter, letter === '.' ? styles.dot : null]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
        <Animated.View entering={taglineEntering}>
          <Text style={styles.tagline}>Your feeds, minus the bait.</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
