import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, spacing } from '../theme';

interface StatusViewProps {
  /** Emoji or any element shown at the top (e.g. an ActivityIndicator). */
  icon: ReactNode;
  title: string;
  message?: string;
  /** Optional action, usually a PrimaryButton. */
  children?: ReactNode;
}

/** Shared full-screen layout for loading, error and result states. */
export function StatusView({ icon, title, message, children }: StatusViewProps) {
  const { font } = useResponsive();

  return (
    <View style={styles.container}>
      {typeof icon === 'string' ? (
        <Text style={{ fontSize: font(64) }}>{icon}</Text>
      ) : (
        icon
      )}
      <Text style={[styles.title, { fontSize: font(26) }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { fontSize: font(16), lineHeight: font(23) }]}>
          {message}
        </Text>
      ) : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
