/** Per-platform tools that slow you down: a pause before opening, a daily time limit, grayscale pages. */
export type FocusSettings = {
  /** Seconds to wait before a platform opens. 0 turns the pause off. */
  pauseSeconds: number;
  /** Minutes allowed per day. 0 turns the limit off. */
  dailyLimitMinutes: number;
  grayscale: boolean;
};

/** Saved settings by platform id; missing fields follow `DEFAULT_FOCUS`. */
export type FocusByPlatform = Readonly<Record<string, Partial<FocusSettings>>>;

export const DEFAULT_FOCUS: FocusSettings = {
  pauseSeconds: 0,
  dailyLimitMinutes: 0,
  grayscale: false,
};

export const PAUSE_OPTIONS: readonly number[] = [0, 5, 10, 20];
export const LIMIT_OPTIONS: readonly number[] = [0, 15, 30, 60, 120];

/** Minutes granted by "a few more minutes" on the limit screen. */
export const EXTENSION_MINUTES = 5;

export function focusFor(all: FocusByPlatform, platformId: string): FocusSettings {
  return { ...DEFAULT_FOCUS, ...all[platformId] };
}

/**
 * Whether today's limit blocks the platform right now. An extension lifts the block until
 * `extendedUntil` (a timestamp in ms), whatever the time already used.
 */
export function isOverLimit(
  settings: FocusSettings,
  secondsToday: number,
  extendedUntil: number,
  now: number,
): boolean {
  if (settings.dailyLimitMinutes <= 0) return false;
  if (now < extendedUntil) return false;
  return secondsToday >= settings.dailyLimitMinutes * 60;
}

export function pauseLabel(seconds: number): string {
  return seconds === 0 ? 'Off' : `${seconds} s`;
}

export function limitLabel(minutes: number): string {
  if (minutes === 0) return 'Off';
  return minutes < 60 ? `${minutes} min` : `${minutes / 60} h`;
}
