import * as Haptics from 'expo-haptics';
import { Switch, Text, View } from 'react-native';

import { colors } from '@/theme';

import { styles } from './ToggleRow.styles';

const SWITCH_TRACK = { false: colors.border, true: colors.accent } as const;

type Props = {
  label: string;
  description?: string;
  on: boolean;
  /** Draws a line above the row; false for the first row in a group. */
  divider: boolean;
  onChange: (on: boolean) => void;
};

export function ToggleRow({ label, description, on, divider, onChange }: Props) {
  return (
    <View style={[styles.row, divider ? styles.divider : null]}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
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
