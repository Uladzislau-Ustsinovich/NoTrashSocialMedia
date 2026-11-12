import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 22,
  },
  header: {
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  version: {
    color: colors.textMuted,
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginLeft: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: 16,
    gap: 10,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13.5,
    lineHeight: 19,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linkText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  danger: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  dangerText: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
  },
});
