import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';

import { colors } from '@/theme';

import { styles } from './BrowserToolbar.styles';
import { PressableScale } from './PressableScale';

type Props = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onOpenFilters: () => void;
};

export function BrowserToolbar({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onHome,
  onOpenFilters,
}: Props) {
  return (
    <View style={styles.toolbar}>
      <ToolbarButton icon="chevron-back" label="Back" disabled={!canGoBack} onPress={onBack} />
      <ToolbarButton icon="chevron-forward" label="Forward" disabled={!canGoForward} onPress={onForward} />
      <ToolbarButton icon="refresh" label="Reload" onPress={onReload} />
      <ToolbarButton icon="home-outline" label="Home" onPress={onHome} />
      <ToolbarButton icon="options-outline" label="Filters" highlighted onPress={onOpenFilters} />
    </View>
  );
}

type ToolbarButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  highlighted?: boolean;
  onPress: () => void;
};

function iconColor(disabled: boolean, highlighted: boolean): string {
  if (disabled) return colors.disabled;
  return highlighted ? colors.accent : colors.text;
}

function ToolbarButton({ icon, label, disabled = false, highlighted = false, onPress }: ToolbarButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      pressedScale={0.82}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={styles.button}
    >
      <Ionicons name={icon} size={23} color={iconColor(disabled, highlighted)} />
    </PressableScale>
  );
}
