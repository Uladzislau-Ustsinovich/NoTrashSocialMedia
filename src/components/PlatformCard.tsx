import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Platform } from '@/platforms';
import { colors, radius } from '@/theme';

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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: 16,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: {
    color: colors.onAccent,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '600',
  },
  filtersButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
