import * as Haptics from 'expo-haptics';
import { Text, View } from 'react-native';

import { styles } from './OptionRow.styles';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  description: string;
  options: readonly number[];
  value: number;
  /** Text for an option, e.g. 15 -> "15 min". */
  format: (option: number) => string;
  /** Draws a line above the row; false for the first row in a group. */
  divider: boolean;
  onChange: (option: number) => void;
};

/** A setting chosen from a few fixed values, shown as a row of chips. */
export function OptionRow({
  label,
  description,
  options,
  value,
  format,
  divider,
  onChange,
}: Props) {
  return (
    <View style={[styles.row, divider ? styles.divider : null]}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <PressableScale
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={format(option)}
              pressedScale={0.92}
              onPress={() => {
                void Haptics.selectionAsync();
                onChange(option);
              }}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                {format(option)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
