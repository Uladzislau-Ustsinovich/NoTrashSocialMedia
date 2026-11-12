import { USAGE_DAYS_KEPT, addSeconds, dayKey, formatDuration, secondsOn } from '../usage';

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

  it('drops the oldest days beyond the retention limit', () => {
    let log = {};
    for (let n = 1; n <= USAGE_DAYS_KEPT + 3; n++) log = addSeconds(log, 'x', 1, day(n));

    expect(Object.keys(log)).toHaveLength(USAGE_DAYS_KEPT);
    expect(secondsOn(log, 'x', day(3))).toBe(0);
    expect(secondsOn(log, 'x', day(4))).toBe(1);
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
