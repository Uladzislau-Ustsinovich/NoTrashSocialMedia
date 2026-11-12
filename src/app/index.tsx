import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlatformCard } from '@/components/PlatformCard';
import { PLATFORMS } from '@/platforms';
import { isToggleOn, useToggleState } from '@/store/toggles';
import { useWelcomeDone } from '@/store/welcome';
import { colors, spacing } from '@/theme';

function greeting(hour: number): string {
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

const enter = (index: number) => FadeInDown.delay(index * 90).duration(480);

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { overrides } = useToggleState();
  const welcomeDone = useWelcomeDone();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Mounted once the hello animation steps aside, so the entrance is seen. */}
      {welcomeDone ? (
        <>
          <Animated.View entering={enter(0)} style={styles.brand}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>NoTrash</Text>
          </Animated.View>
          <Animated.View entering={enter(1)} style={styles.heading}>
            <Text style={styles.title}>{greeting(new Date().getHours())}</Text>
            <Text style={styles.subtitle}>Pick a feed. The bait stays out.</Text>
          </Animated.View>
          <View style={styles.cards}>
            {PLATFORMS.map((platform, index) => (
              <Animated.View key={platform.id} entering={enter(index + 2)}>
                <PlatformCard
                  platform={platform}
                  activeCount={platform.toggles.filter((toggle) => isToggleOn(toggle, overrides)).length}
                  onOpen={() =>
                    router.push({ pathname: '/browser/[platform]', params: { platform: platform.id } })
                  }
                  onOpenFilters={() =>
                    router.push({ pathname: '/settings/[platform]', params: { platform: platform.id } })
                  }
                />
              </Animated.View>
            ))}
          </View>
          <Animated.View entering={enter(PLATFORMS.length + 2)}>
            <Text style={styles.footnote}>
              Filters run on your device. Nothing you do here is collected.
            </Text>
          </Animated.View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  brandText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heading: {
    gap: 6,
    marginBottom: 26,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 23,
  },
  cards: {
    gap: spacing.gap,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 26,
    paddingHorizontal: 12,
  },
});
