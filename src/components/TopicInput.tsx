import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface TopicInputProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Pressing Enter / Done on the keyboard. */
  onSubmit: () => void;
  maxLength: number;
  /** Shown under the box, e.g. when Start was pressed with no topic. */
  error?: string;
}

/** Where players type their own topic. Styled for the purple start screen. */
export function TopicInput({ value, onChangeText, onSubmit, maxLength, error }: TopicInputProps) {
  const { font } = useResponsive();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: font(15) }]}>Your topic</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        maxLength={maxLength}
        placeholder="e.g. Saudi history, Harry Potter, space"
        placeholderTextColor="rgba(255,255,255,0.55)"
        returnKeyType="go"
        autoCorrect={false}
        accessibilityLabel="Your topic"
        style={[styles.input, { fontSize: font(16) }, error ? styles.inputError : null]}
      />
      <Text style={[error ? styles.error : styles.hint, { fontSize: font(13) }]}>
        {error ?? '✨ AI writes fresh questions about anything you type.'}
      </Text>
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
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: colors.onPrimary,
    fontWeight: '700',
  },
  inputError: {
    borderColor: colors.wrongBg,
  },
  hint: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  error: {
    color: colors.wrongBg,
    fontWeight: '800',
  },
});
