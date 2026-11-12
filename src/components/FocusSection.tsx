import { View } from 'react-native';

import type { Platform } from '@/platforms';
import { setFocus, useFocusSettings } from '@/store/focus';
import { LIMIT_OPTIONS, PAUSE_OPTIONS, limitLabel, pauseLabel } from '@/utils/focus';

import { OptionRow } from './OptionRow';
import { ToggleRow } from './ToggleRow';

/** The focus tools for one platform: pause before opening, daily limit, grayscale. */
export function FocusSection({ platform }: { platform: Platform }) {
  const { settings } = useFocusSettings(platform.id);

  return (
    <View>
      <OptionRow
        label="Pause before opening"
        description={`A short wait each time you open ${platform.name}, with a way out.`}
        options={PAUSE_OPTIONS}
        value={settings.pauseSeconds}
        format={pauseLabel}
        divider={false}
        onChange={(pauseSeconds) => setFocus(platform.id, { pauseSeconds })}
      />
      <OptionRow
        label="Daily limit"
        description="After this much time in a day, the site is put away."
        options={LIMIT_OPTIONS}
        value={settings.dailyLimitMinutes}
        format={limitLabel}
        divider
        onChange={(dailyLimitMinutes) => setFocus(platform.id, { dailyLimitMinutes })}
      />
      <ToggleRow
        label="Grayscale"
        description="Shows the site without colour, which makes it less tempting."
        on={settings.grayscale}
        divider
        onChange={(grayscale) => setFocus(platform.id, { grayscale })}
      />
    </View>
  );
}
