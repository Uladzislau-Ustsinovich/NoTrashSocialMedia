import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 10,
  },
  word: {
    flexDirection: 'row',
  },
  letter: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  dot: {
    color: colors.accent,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 17,
  },
});
