import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useBreathing } from '@/hooks/useBreathing';
import { useCountdown } from '@/hooks/useCountdown';

import { styles } from './Gate.styles';
import { PressableScale } from './PressableScale';

type Props = {
  platformName: string;
  seconds: number;
  onDone: () => void;
  onCancel: () => void;
};

/** A short wait before a platform opens, with the option to change your mind. */
export function PauseGate({ platformName, seconds, onDone, onCancel }: Props) {
  const left = useCountdown(seconds, onDone);
  const breathing = useBreathing();

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Animated.View style={[styles.ring, breathing]}>
        <Text style={styles.count} accessibilityLabel={`${left} seconds left`}>
          {left}
        </Text>
      </Animated.View>
      <View style={styles.text}>
        <Text style={styles.title}>Take a breath.</Text>
        <Text style={styles.body}>{platformName} opens in a moment. Still want it?</Text>
      </View>
      <View style={styles.actions}>
        <PressableScale accessibilityRole="button" onPress={onCancel} style={styles.primary}>
          <Text style={styles.primaryText}>Not now</Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}
