import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { getPlatform } from '@/platforms';
import type { Toggle, ToggleGroup } from '@/platforms';
import { isToggleOn, resetToggles, setToggle, useToggleState } from '@/store/toggles';
import { colors, radius, spacing } from '@/theme';

const GROUPS: readonly ToggleGroup[] = ['Feed', 'Navigation'];
const SWITCH_TRACK = { false: colors.border, true: colors.accent } as const;

export default function PlatformSettings() {
  const { platform: platformId } = useLocalSearchParams<{ platform: string }>();
  const platform = getPlatform(platformId);
  const { overrides } = useToggleState();

  if (!platform) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Unknown platform.</Text>
      </View>
    );
  }

  const activeCount = platform.toggles.filter((toggle) => isToggleOn(toggle, overrides)).length;
  const changed = platform.toggles.some((toggle) => toggle.id in overrides);
  const sections = GROUPS.map((group) => ({
    group,
    toggles: platform.toggles.filter((toggle) => toggle.group === group),
  })).filter((section) => section.toggles.length > 0);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: `${platform.name} filters` }} />
      <Animated.View entering={FadeInDown.duration(400)} style={styles.summary}>
        <Text style={styles.summaryCount}>{activeCount}</Text>
        <Text style={styles.summaryText}>
          of {platform.toggles.length} filters on.{'\n'}Switch on what you want removed.
        </Text>
      </Animated.View>

      {sections.map((section, sectionIndex) => (
        <Animated.View
          key={section.group}
          entering={FadeInDown.delay(80 + sectionIndex * 90).duration(420)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{section.group.toUpperCase()}</Text>
          <View style={styles.group}>
            {section.toggles.map((toggle, index) => (
              <ToggleRow
                key={toggle.id}
                toggle={toggle}
                on={isToggleOn(toggle, overrides)}
                divider={index > 0}
              />
            ))}
          </View>
        </Animated.View>
      ))}

      {changed ? (
        <PressableScale
          accessibilityRole="button"
          onPress={() => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resetToggles(platform.toggles.map((toggle) => toggle.id));
          }}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset to defaults</Text>
        </PressableScale>
      ) : null}
    </ScrollView>
  );
}

function ToggleRow({ toggle, on, divider }: { toggle: Toggle; on: boolean; divider: boolean }) {
  return (
    <View style={[styles.row, divider ? styles.rowDivider : null]}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{toggle.label}</Text>
        {toggle.description ? <Text style={styles.description}>{toggle.description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={toggle.label}
        value={on}
        trackColor={SWITCH_TRACK}
        ios_backgroundColor={colors.border}
        onValueChange={(next) => {
          void Haptics.selectionAsync();
          setToggle(toggle.id, next);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 22,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryCount: {
    color: colors.accent,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  summaryText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginLeft: 6,
  },
  group: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  reset: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  resetText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
