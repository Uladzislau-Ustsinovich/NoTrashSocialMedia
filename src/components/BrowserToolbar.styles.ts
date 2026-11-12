import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 2,
  },
  button: {
    width: 52,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
