import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@/theme';
import { EXTENSION_MINUTES, limitLabel } from '@/utils/focus';
import { formatDuration } from '@/utils/usage';

import { styles } from './Gate.styles';
import { PressableScale } from './PressableScale';

type Props = {
  platformName: string;
  limitMinutes: number;
  secondsToday: number;
  onLeave: () => void;
  onExtend: () => void;
};

/** Shown instead of a platform once today's limit is used up. */
export function LimitGate({ platformName, limitMinutes, secondsToday, onLeave, onExtend }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={[styles.ring, styles.ringMuted]}>
        <Ionicons name="moon-outline" size={54} color={colors.accent} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>That's today's {platformName}.</Text>
        <Text style={styles.body}>
          You set a limit of {limitLabel(limitMinutes)} a day and have spent{' '}
          {formatDuration(secondsToday)}.
        </Text>
      </View>
      <View style={styles.actions}>
        <PressableScale accessibilityRole="button" onPress={onLeave} style={styles.primary}>
          <Text style={styles.primaryText}>Done for today</Text>
        </PressableScale>
        <PressableScale accessibilityRole="button" onPress={onExtend} style={styles.secondary}>
          <Text style={styles.secondaryText}>{EXTENSION_MINUTES} more minutes</Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}
