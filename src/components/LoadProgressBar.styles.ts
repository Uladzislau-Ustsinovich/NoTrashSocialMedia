import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

const HEIGHT = 2;

export const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    backgroundColor: colors.background,
  },
  bar: {
    height: HEIGHT,
    backgroundColor: colors.accent,
    transformOrigin: 'left',
  },
});
