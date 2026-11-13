import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { Platform } from '@/platforms';
import { colors } from '@/theme';
import { limitLabel } from '@/utils/focus';
import { usageLine } from '@/utils/usage';

import { styles } from './PlatformCard.styles';
import { PressableScale } from './PressableScale';

type Props = {
  platform: Platform;
  activeCount: number;
  /** Seconds spent on this platform today. */
  secondsToday: number;
  /** Today's limit in minutes, or 0 when there is none. */
  limitMinutes: number;
  onOpen: () => void;
  onOpenFilters: () => void;
};

export function PlatformCard({
  platform,
  activeCount,
  secondsToday,
  limitMinutes,
  onOpen,
  onOpenFilters,
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Open ${platform.name}`}
      onPress={onOpen}
      style={styles.card}
    >
      <View style={[styles.tile, { backgroundColor: platform.tint }]}>
        <Text style={styles.monogram}>{platform.monogram}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{platform.name}</Text>
        <Text style={styles.tagline} numberOfLines={2}>
          {platform.tagline}
        </Text>
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {activeCount} of {platform.toggles.length} filters on
          </Text>
        </View>
        {secondsToday > 0 || limitMinutes > 0 ? (
          <Text style={styles.usage}>
            {usageLine(secondsToday, limitMinutes > 0 ? limitLabel(limitMinutes) : undefined)}
          </Text>
        ) : null}
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${platform.name} filters`}
        hitSlop={10}
        pressedScale={0.88}
        onPress={onOpenFilters}
        style={styles.filtersButton}
      >
        <Ionicons name="options-outline" size={20} color={colors.text} />
      </PressableScale>
    </PressableScale>
  );
}
