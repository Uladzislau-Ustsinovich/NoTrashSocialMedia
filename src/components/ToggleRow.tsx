import * as Haptics from 'expo-haptics';
import { Switch, Text, View } from 'react-native';

import type { Toggle } from '@/platforms';
import { colors } from '@/theme';

import { styles } from './ToggleRow.styles';

const SWITCH_TRACK = { false: colors.border, true: colors.accent } as const;

type Props = {
  toggle: Toggle;
  on: boolean;
  /** Draws a line above the row; false for the first row in a group. */
  divider: boolean;
  onChange: (on: boolean) => void;
};

export function ToggleRow({ toggle, on, divider, onChange }: Props) {
  return (
    <View style={[styles.row, divider ? styles.divider : null]}>
      <View style={styles.text}>
        <Text style={styles.label}>{toggle.label}</Text>
        {toggle.description ? <Text style={styles.description}>{toggle.description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={toggle.label}
        value={on}
        trackColor={SWITCH_TRACK}
        ios_backgroundColor={colors.border}
        onValueChange={(next) => {
          void Haptics.selectionAsync();
          onChange(next);
        }}
      />
    </View>
  );
}
