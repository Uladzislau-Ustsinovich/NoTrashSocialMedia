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

/** Returns a new log with `seconds` added for the platform on `date`, and days older than the limit dropped. */
export function addSeconds(log: UsageLog, platformId: string, seconds: number, date: Date): UsageLog {
  const today = dayKey(date);
  const next: Record<string, Readonly<Record<string, number>>> = {
    ...log,
    [today]: { ...log[today], [platformId]: (log[today]?.[platformId] ?? 0) + seconds },
  };
  // Day keys sort chronologically as strings.
  const days = Object.keys(next).sort();
  for (const stale of days.slice(0, Math.max(0, days.length - USAGE_DAYS_KEPT))) delete next[stale];
  return next;
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
