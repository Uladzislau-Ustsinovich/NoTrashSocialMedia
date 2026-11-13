import { DEFAULT_FOCUS, focusFor, isOverLimit, limitLabel, pauseLabel } from '@/utils/focus';

describe('focusFor', () => {
  it('fills missing fields with defaults', () => {
    expect(focusFor({}, 'x')).toEqual(DEFAULT_FOCUS);
    expect(focusFor({ x: { grayscale: true } }, 'x')).toEqual({
      ...DEFAULT_FOCUS,
      grayscale: true,
    });
    expect(focusFor({ other: { grayscale: true } }, 'x')).toEqual(DEFAULT_FOCUS);
  });
});

describe('isOverLimit', () => {
  const limit30 = { ...DEFAULT_FOCUS, dailyLimitMinutes: 30 };
  const now = 1_000_000;

  it('never blocks when the limit is off', () => {
    expect(isOverLimit(DEFAULT_FOCUS, 99_999, 0, now)).toBe(false);
  });

  it('blocks once the time used reaches the limit', () => {
    expect(isOverLimit(limit30, 30 * 60 - 1, 0, now)).toBe(false);
    expect(isOverLimit(limit30, 30 * 60, 0, now)).toBe(true);
  });

  it('is lifted by an extension until it runs out', () => {
    expect(isOverLimit(limit30, 40 * 60, now + 1, now)).toBe(false);
    expect(isOverLimit(limit30, 40 * 60, now, now)).toBe(true);
  });
});

describe('labels', () => {
  it('formats pause and limit options', () => {
    expect([0, 5].map(pauseLabel)).toEqual(['Off', '5 s']);
    expect([0, 15, 60, 120].map(limitLabel)).toEqual(['Off', '15 min', '1 h', '2 h']);
  });
});
