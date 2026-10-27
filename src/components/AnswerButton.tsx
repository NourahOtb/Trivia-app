import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';
import { AnswerStatus } from '../types/quiz';

interface AnswerButtonProps {
  label: string;
  /** Letter shown in the badge, e.g. "A". */
  marker: string;
  status: AnswerStatus;
  disabled: boolean;
  onPress: (label: string) => void;
}

const statusStyles: Record<AnswerStatus, { bg: string; border: string; text: string }> = {
  idle: { bg: colors.surface, border: colors.border, text: colors.text },
  correct: { bg: colors.correctBg, border: colors.correct, text: colors.correct },
  wrong: { bg: colors.wrongBg, border: colors.wrong, text: colors.wrong },
  dimmed: { bg: colors.surface, border: colors.border, text: colors.dimmed },
  removed: { bg: colors.background, border: colors.border, text: colors.dimmed },
};

// Icons as well as colour, so results are clear for colour-blind players too.
const statusIcon: Partial<Record<AnswerStatus, string>> = {
  correct: '✓',
  wrong: '✗',
  removed: '–',
};

const statusSuffix: Partial<Record<AnswerStatus, string>> = {
  correct: ', correct',
  wrong: ', wrong',
  removed: ', removed by 50/50',
};

function AnswerButtonBase({ label, marker, status, disabled, onPress }: AnswerButtonProps) {
  const { font } = useResponsive();
  const palette = statusStyles[status];
  const icon = statusIcon[status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${statusSuffix[status] ?? ''}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onPress(label)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        status === 'removed' && styles.removed,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.badge, { borderColor: palette.border }]}>
        <Text style={[styles.badgeText, { color: palette.text, fontSize: font(14) }]}>
          {icon ?? marker}
        </Text>
      </View>
      <Text
        style={[
          styles.label,
          { color: palette.text, fontSize: font(17) },
          status === 'removed' && styles.removedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export const AnswerButton = memo(AnswerButtonBase);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    gap: spacing.md,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
  removed: {
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  removedLabel: {
    textDecorationLine: 'line-through',
  },
});
