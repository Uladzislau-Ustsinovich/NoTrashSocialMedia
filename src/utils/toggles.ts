import type { Platform, Toggle, ToggleGroup } from '@/platforms';

/** Switches the user has changed, by toggle id. Everything else follows `defaultOn`. */
export type ToggleOverrides = Readonly<Record<string, boolean>>;

const GROUP_ORDER: readonly ToggleGroup[] = ['Feed', 'Navigation'];

export function isToggleOn(toggle: Toggle, overrides: ToggleOverrides): boolean {
  return overrides[toggle.id] ?? toggle.defaultOn;
}

export function countActiveToggles(platform: Platform, overrides: ToggleOverrides): number {
  return platform.toggles.filter((toggle) => isToggleOn(toggle, overrides)).length;
}

export function hasOverrides(platform: Platform, overrides: ToggleOverrides): boolean {
  return platform.toggles.some((toggle) => toggle.id in overrides);
}

export type ToggleSection = { group: ToggleGroup; toggles: Toggle[] };

/** The platform's switches split into the sections shown on the filters screen, empty ones dropped. */
export function groupToggles(platform: Platform): ToggleSection[] {
  return GROUP_ORDER.map((group) => ({
    group,
    toggles: platform.toggles.filter((toggle) => toggle.group === group),
  })).filter((section) => section.toggles.length > 0);
}
