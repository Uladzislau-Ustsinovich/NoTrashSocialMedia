import { StyleSheet } from 'react-native';

import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: 16,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: {
    color: colors.onAccent,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '600',
  },
  usage: {
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  filtersButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
