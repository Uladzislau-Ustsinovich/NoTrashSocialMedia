import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';

/** Shared by the pause and limit screens that stand in front of a platform. */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen + 8,
    gap: 28,
  },
  ring: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMuted: {
    borderColor: colors.border,
  },
  count: {
    color: colors.text,
    fontSize: 54,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  text: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  primary: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  primaryText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
