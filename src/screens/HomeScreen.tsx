import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlatformCard } from '@/components/PlatformCard';
import { PLATFORMS } from '@/platforms';
import { useToggleState } from '@/store/toggles';
import { useWelcomeDone } from '@/store/welcome';
import { greeting } from '@/utils/greeting';
import { countActiveToggles } from '@/utils/toggles';

import { styles } from './HomeScreen.styles';

const enter = (index: number) => FadeInDown.delay(index * 90).duration(480);

export default function HomeScreen() {
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
                  activeCount={countActiveToggles(platform, overrides)}
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
