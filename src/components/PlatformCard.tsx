import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { Platform } from '@/platforms';
import { colors } from '@/theme';

import { styles } from './PlatformCard.styles';
import { PressableScale } from './PressableScale';

type Props = {
  platform: Platform;
  activeCount: number;
  onOpen: () => void;
  onOpenFilters: () => void;
};

export function PlatformCard({ platform, activeCount, onOpen, onOpenFilters }: Props) {
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
