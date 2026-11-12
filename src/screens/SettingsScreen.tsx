import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FocusSection } from '@/components/FocusSection';
import { PressableScale } from '@/components/PressableScale';
import { ToggleRow } from '@/components/ToggleRow';
import { usePlatformParam } from '@/hooks/usePlatformParam';
import { resetToggles, setToggle, useToggleState } from '@/store/toggles';
import { countActiveToggles, groupToggles, hasOverrides, isToggleOn } from '@/utils/toggles';

import { styles } from './SettingsScreen.styles';

const summaryEntering = FadeInDown.duration(400);
const sectionEntering = (index: number) => FadeInDown.delay(80 + index * 90).duration(420);

export default function SettingsScreen() {
  const { platform } = usePlatformParam();
  const { overrides } = useToggleState();

  if (!platform) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Unknown platform.</Text>
      </View>
    );
  }

  const sections = groupToggles(platform);
  const resetToDefaults = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetToggles(platform.toggles.map((toggle) => toggle.id));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: `${platform.name} filters` }} />
      <Animated.View entering={summaryEntering} style={styles.summary}>
        <Text style={styles.summaryCount}>{countActiveToggles(platform, overrides)}</Text>
        <Text style={styles.summaryText}>
          of {platform.toggles.length} filters on.{'\n'}Switch on what you want removed.
        </Text>
      </Animated.View>

      {sections.map((section, sectionIndex) => (
        <Animated.View
          key={section.group}
          entering={sectionEntering(sectionIndex)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{section.group.toUpperCase()}</Text>
          <View style={styles.group}>
            {section.toggles.map((toggle, index) => (
              <ToggleRow
                key={toggle.id}
                label={toggle.label}
                description={toggle.description}
                on={isToggleOn(toggle, overrides)}
                divider={index > 0}
                onChange={(on) => setToggle(toggle.id, on)}
              />
            ))}
          </View>
        </Animated.View>
      ))}

      <Animated.View entering={sectionEntering(sections.length)} style={styles.section}>
        <Text style={styles.sectionTitle}>FOCUS</Text>
        <View style={styles.group}>
          <FocusSection platform={platform} />
        </View>
      </Animated.View>

      {hasOverrides(platform, overrides) ? (
        <PressableScale accessibilityRole="button" onPress={resetToDefaults} style={styles.reset}>
          <Text style={styles.resetText}>Reset to defaults</Text>
        </PressableScale>
      ) : null}
    </ScrollView>
  );
}
