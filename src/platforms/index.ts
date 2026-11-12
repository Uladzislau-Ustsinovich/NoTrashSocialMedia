import { instagram } from './instagram';
import type { Platform } from './types';
import { x } from './x';
import { youtube } from './youtube';

export type { Platform, Toggle, ToggleGroup } from './types';

const ALL_PLATFORMS: readonly Platform[] = [instagram, youtube, x];

/** Platforms offered in the app. */
export const PLATFORMS: readonly Platform[] = ALL_PLATFORMS.filter((platform) => !platform.hidden);

export function getPlatform(id: string | undefined): Platform | undefined {
  return PLATFORMS.find((platform) => platform.id === id);
}
