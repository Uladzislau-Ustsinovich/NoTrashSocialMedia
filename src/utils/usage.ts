/** Seconds spent per platform id, per local day (`YYYY-MM-DD`). */
export type UsageLog = Readonly<Record<string, Readonly<Record<string, number>>>>;

/** Days of history kept on the device. */
export const USAGE_DAYS_KEPT = 14;

/** Local calendar day as `YYYY-MM-DD`. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function secondsOn(log: UsageLog, platformId: string, date: Date): number {
  return log[dayKey(date)]?.[platformId] ?? 0;
}

/** Returns a new log with `seconds` added for the platform on `date`, and days outside the retention window dropped. */
export function addSeconds(log: UsageLog, platformId: string, seconds: number, date: Date): UsageLog {
  const today = dayKey(date);
  const oldest = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (USAGE_DAYS_KEPT - 1));
  const oldestKey = dayKey(oldest);

  const next: Record<string, Readonly<Record<string, number>>> = {};
  // Day keys compare chronologically as strings. Future keys (clock set back) are dropped too.
  for (const [key, value] of Object.entries(log)) {
    if (key >= oldestKey && key <= today) next[key] = value;
  }
  next[today] = { ...next[today], [platformId]: (next[today]?.[platformId] ?? 0) + seconds };
  return next;
}

/**
 * Whole seconds to record since `countedUntil`, and the new `countedUntil` (the sub-second
 * remainder carries over). A gap longer than `maxGapMs` or a clock that went backwards means the
 * clock jumped rather than time was spent, so nothing beyond the cap is counted.
 */
export function countElapsed(
  countedUntil: number,
  now: number,
  maxGapMs: number,
): { seconds: number; countedUntil: number } {
  const elapsed = now - countedUntil;
  if (elapsed < 0) return { seconds: 0, countedUntil: now };
  if (elapsed > maxGapMs) return { seconds: Math.floor(maxGapMs / 1000), countedUntil: now };
  const seconds = Math.floor(elapsed / 1000);
  return { seconds, countedUntil: countedUntil + seconds * 1000 };
}

/** "under a minute", "12 min", "1 h", "1 h 5 min". */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return 'under a minute';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Home-card line: "12 min today", or "12 min of 30 min today" when `limitText` is given. */
export function usageLine(secondsToday: number, limitText?: string): string {
  const spent = secondsToday > 0 ? formatDuration(secondsToday) : '0 min';
  return limitText ? `${spent} of ${limitText} today` : `${spent} today`;
}
