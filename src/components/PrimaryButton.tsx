import { Pressable, StyleSheet, Text } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  /** `secondary` is an outlined button for less important actions. */
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({ title, onPress, variant = 'primary' }: PrimaryButtonProps) {
  const { font } = useResponsive();
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && (secondary ? styles.secondaryPressed : styles.pressed),
      ]}
    >
      <Text style={[styles.title, { fontSize: font(18) }, secondary && styles.secondaryTitle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryPressed: {
    backgroundColor: colors.primaryLight,
  },
  title: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  secondaryTitle: {
    color: colors.primary,
  },
});
