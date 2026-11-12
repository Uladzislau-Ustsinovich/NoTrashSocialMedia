import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { hydrateFocus } from '@/store/focus';
import { hydrateToggles } from '@/store/toggles';
import { hydrateUsage } from '@/store/usage';
import { colors } from '@/theme';

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.background },
} as const;

/** Keeps the home screen under a screen opened by a deep link, so there is always a way back. */
export const unstable_settings = { anchor: 'index' };

export default function RootLayout() {
  useEffect(() => {
    void hydrateToggles();
    void hydrateUsage();
    void hydrateFocus();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="browser/[platform]" options={{ title: '' }} />
        <Stack.Screen name="settings/[platform]" options={{ title: 'Filters', presentation: 'modal' }} />
        <Stack.Screen name="about" options={{ title: 'About', presentation: 'modal' }} />
      </Stack>
      <WelcomeOverlay />
    </>
  );
}
