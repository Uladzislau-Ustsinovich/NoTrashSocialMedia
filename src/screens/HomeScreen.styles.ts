import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  brandText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heading: {
    gap: 6,
    marginBottom: 26,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 23,
  },
  cards: {
    gap: spacing.gap,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 26,
    paddingHorizontal: 12,
  },
});
