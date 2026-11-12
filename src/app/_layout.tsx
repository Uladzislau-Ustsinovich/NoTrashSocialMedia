import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { hydrateToggles } from '@/store/toggles';
import { colors } from '@/theme';

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.background },
} as const;

export default function RootLayout() {
  useEffect(() => {
    void hydrateToggles();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="browser/[platform]" options={{ title: '' }} />
        <Stack.Screen name="settings/[platform]" options={{ title: 'Filters', presentation: 'modal' }} />
      </Stack>
      <WelcomeOverlay />
    </>
  );
}
