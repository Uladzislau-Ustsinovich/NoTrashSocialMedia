import { StyleSheet } from 'react-native';

import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    gap: 10,
  },
  divider: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: {
    gap: 3,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.onAccent,
  },
});
