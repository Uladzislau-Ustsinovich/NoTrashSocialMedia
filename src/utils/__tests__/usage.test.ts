import { USAGE_DAYS_KEPT, addSeconds, countElapsed, dayKey, formatDuration, secondsOn } from '../usage';

const day = (n: number) => new Date(2026, 0, n, 12);

describe('dayKey', () => {
  it('uses the local calendar day, zero-padded', () => {
    expect(dayKey(new Date(2026, 2, 5, 23, 59))).toBe('2026-03-05');
  });
});

describe('addSeconds', () => {
  it('accumulates per platform and day without mutating the input', () => {
    const empty = {};
    const once = addSeconds(empty, 'x', 30, day(1));
    const twice = addSeconds(once, 'x', 45, day(1));
    const other = addSeconds(twice, 'instagram', 10, day(1));

    expect(empty).toEqual({});
    expect(secondsOn(other, 'x', day(1))).toBe(75);
    expect(secondsOn(other, 'instagram', day(1))).toBe(10);
    expect(secondsOn(other, 'x', day(2))).toBe(0);
  });

  it('keeps a window of calendar days, however few of them have entries', () => {
    let log = addSeconds({}, 'x', 1, day(1));
    log = addSeconds(log, 'x', 1, day(USAGE_DAYS_KEPT));
    expect(secondsOn(log, 'x', day(1))).toBe(1);

    log = addSeconds(log, 'x', 1, day(USAGE_DAYS_KEPT + 1));
    expect(secondsOn(log, 'x', day(1))).toBe(0);
    expect(secondsOn(log, 'x', day(USAGE_DAYS_KEPT))).toBe(1);
  });

  it('keeps the new entry and drops future days when the clock is set back', () => {
    const ahead = addSeconds({}, 'x', 9, day(20));
    const back = addSeconds(ahead, 'x', 5, day(10));

    expect(secondsOn(back, 'x', day(10))).toBe(5);
    expect(secondsOn(back, 'x', day(20))).toBe(0);
  });
});

describe('countElapsed', () => {
  const MAX = 30_000;

  it('counts whole seconds and carries the remainder', () => {
    expect(countElapsed(1_000, 3_700, MAX)).toEqual({ seconds: 2, countedUntil: 3_000 });
    expect(countElapsed(3_000, 3_900, MAX)).toEqual({ seconds: 0, countedUntil: 3_000 });
    expect(countElapsed(3_000, 4_000, MAX)).toEqual({ seconds: 1, countedUntil: 4_000 });
  });

  it('caps a forward clock jump at the longest plausible gap', () => {
    expect(countElapsed(0, 3_600_000, MAX)).toEqual({ seconds: 30, countedUntil: 3_600_000 });
  });

  it('counts nothing and resyncs when the clock goes backwards', () => {
    expect(countElapsed(10_000, 4_000, MAX)).toEqual({ seconds: 0, countedUntil: 4_000 });
  });
});

describe('formatDuration', () => {
  it.each([
    [0, 'under a minute'],
    [59, 'under a minute'],
    [60, '1 min'],
    [3599, '59 min'],
    [3600, '1 h'],
    [3900, '1 h 5 min'],
  ])('%i seconds -> %s', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
