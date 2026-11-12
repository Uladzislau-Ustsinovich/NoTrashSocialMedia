import { useLocalSearchParams } from 'expo-router';

import { getPlatform } from '@/platforms';

/** The platform named by the route's `platform` param, plus the optional `url` start page. */
export function usePlatformParam() {
  const { platform: platformId, url } = useLocalSearchParams<{ platform: string; url?: string }>();
  return { platform: getPlatform(platformId), url };
}
