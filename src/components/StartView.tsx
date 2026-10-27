import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '../hooks/useResponsive';
import { colors, gradients, MAX_CONTENT_WIDTH, radius, spacing } from '../theme';

interface StartViewProps {
  title: string;
  subtitle: string;
  /** Short rules shown as a list, e.g. "5 questions". */
  rules: { icon: string; text: string }[];
  onStart: () => void;
}

export function StartView({ title, subtitle, rules, onStart }: StartViewProps) {
  const { font } = useResponsive();

  return (
    <LinearGradient colors={gradients.hero} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <View style={styles.column}>
          <View style={styles.hero}>
            <View style={styles.logo}>
              <Text style={{ fontSize: font(56) }}>🔮</Text>
            </View>
            <Text style={[styles.title, { fontSize: font(40) }]} accessibilityRole="header">
              {title}
            </Text>
            <Text style={[styles.subtitle, { fontSize: font(17) }]}>{subtitle}</Text>
          </View>

          <View style={styles.rules}>
            {rules.map((rule) => (
              <View key={rule.text} style={styles.rule}>
                <Text style={[styles.ruleIcon, { fontSize: font(20) }]}>{rule.icon}</Text>
                <Text style={[styles.ruleText, { fontSize: font(16) }]}>{rule.text}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [styles.start, pressed && styles.startPressed]}
          >
            <Text style={[styles.startText, { fontSize: font(22) }]}>Start</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.onPrimary,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.primaryLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  rules: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ruleIcon: {
    width: 28,
    textAlign: 'center',
  },
  ruleText: {
    flex: 1,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  start: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  startPressed: {
    transform: [{ scale: 0.97 }],
  },
  startText: {
    color: colors.primaryDark,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
