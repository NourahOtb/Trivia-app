import { Pressable, StyleSheet, Text } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface LifelineButtonProps {
  label: string;
  /** Spoken by screen readers, e.g. "Use 50/50: removes two wrong answers". */
  accessibilityLabel: string;
  used: boolean;
  disabled: boolean;
  onPress: () => void;
}

/** A one-time helper such as 50/50. Greys out once it has been used. */
export function LifelineButton({
  label,
  accessibilityLabel,
  used,
  disabled,
  onPress,
}: LifelineButtonProps) {
  const { font } = useResponsive();
  const inactive = used || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={used ? `${label} already used` : accessibilityLabel}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          { fontSize: font(15) },
          inactive && styles.inactiveLabel,
          used && styles.usedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  inactive: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  inactiveLabel: {
    color: colors.dimmed,
  },
  usedLabel: {
    textDecorationLine: 'line-through',
  },
});
