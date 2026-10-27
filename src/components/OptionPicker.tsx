import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

export interface PickerOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

interface OptionPickerProps<T extends string> {
  title: string;
  options: readonly PickerOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  /** How many options per row on phones. */
  columns?: number;
  /** How many per row on tablets and desktop browsers. */
  wideColumns?: number;
}

/** A grid of tappable chips where exactly one can be selected. Styled for the purple start screen. */
export function OptionPicker<T extends string>({
  title,
  options,
  selectedId,
  onSelect,
  columns = 2,
  wideColumns = columns + 1,
}: OptionPickerProps<T>) {
  const { font, isWide } = useResponsive();
  const perRow = isWide ? wideColumns : columns;
  const basis = `${100 / perRow - 3}%` as const;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: font(15) }]}>{title}</Text>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={title}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.chip,
                { flexBasis: basis },
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              {option.icon ? <Text style={{ fontSize: font(18) }}>{option.icon}</Text> : null}
              <Text
                numberOfLines={2}
                style={[styles.label, { fontSize: font(14) }, selected && styles.labelSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    color: colors.primaryLight,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    flex: 1,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.primaryDark,
  },
});
