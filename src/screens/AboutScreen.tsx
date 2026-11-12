import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { clearUsage } from '@/store/usage';
import { colors } from '@/theme';
import { PRIVACY_POLICY_URL, SOURCE_URL } from '@/utils/about';
import { USAGE_DAYS_KEPT } from '@/utils/usage';

import { styles } from './AboutScreen.styles';

export default function AboutScreen() {
  const [erased, setErased] = useState(false);
  const version = Constants.expoConfig?.version ?? '';

  const confirmErase = () => {
    Alert.alert(
      'Erase usage history?',
      'This deletes the time recorded for every site, including today, so today\'s daily limits start again. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearUsage();
            setErased(true);
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.name}>NoTrash</Text>
        <Text style={styles.version}>Version {version}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WHAT IT DOES</Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            NoTrash opens the mobile web versions of social sites and hides the parts built to keep
            you scrolling. You choose what is hidden, and you can add a pause, a daily limit or
            grayscale to each site.
          </Text>
          <Text style={styles.muted}>
            NoTrash is an independent app. It is not affiliated with, endorsed by or sponsored by
            any site it can open.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR DATA</Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            Nothing is collected. There is no account, no analytics and no advertising. Your
            settings and the last {USAGE_DAYS_KEPT} days of usage time stay on this device.
          </Text>
          <Text style={styles.muted}>
            You sign in on each site's own page. NoTrash never sees your password, and each site
            handles your data under its own privacy policy.
          </Text>
          <PressableScale
            accessibilityRole="button"
            disabled={erased}
            onPress={confirmErase}
            style={styles.danger}
          >
            <Text style={styles.dangerText}>{erased ? 'Usage history erased' : 'Erase usage history'}</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MORE</Text>
        <View style={styles.card}>
          <LinkRow label="Privacy policy" url={PRIVACY_POLICY_URL} />
          <LinkRow label="Source code" url={SOURCE_URL} />
        </View>
      </View>
    </ScrollView>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <PressableScale
      accessibilityRole="link"
      pressedScale={0.98}
      onPress={() => {
        Linking.openURL(url).catch(() => Alert.alert('Could not open the link', url));
      }}
      style={styles.link}
    >
      <Text style={styles.linkText}>{label}</Text>
      <Ionicons name="open-outline" size={18} color={colors.accent} />
    </PressableScale>
  );
}
