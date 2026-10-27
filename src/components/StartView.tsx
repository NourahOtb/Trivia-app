import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useResponsive } from '../hooks/useResponsive';
import { colors, gradients, MAX_CONTENT_WIDTH, radius, spacing } from '../theme';

interface StartViewProps {
  title: string;
  subtitle: string;
  /** Short rules shown as a list, e.g. "5 questions". */
  rules: { icon: string; text: string }[];
  /** Game settings, e.g. category and difficulty pickers. */
  children?: ReactNode;
  onStart: () => void;
}

export function StartView({ title, subtitle, rules, children, onStart }: StartViewProps) {
  const { font } = useResponsive();
  useKeyboardShortcuts({ enter: onStart });

  return (
    <LinearGradient colors={gradients.hero} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.column}>
            <View style={styles.hero}>
              <View style={styles.logo}>
                <Text style={{ fontSize: font(44) }}>🔮</Text>
              </View>
              <Text style={[styles.title, { fontSize: font(36) }]} accessibilityRole="header">
                {title}
              </Text>
              <Text style={[styles.subtitle, { fontSize: font(16) }]}>{subtitle}</Text>
            </View>

            {children}

            <View style={styles.rules}>
              {rules.map((rule) => (
                <View key={rule.text} style={styles.rule}>
                  <Text style={[styles.ruleIcon, { fontSize: font(16) }]}>{rule.icon}</Text>
                  <Text style={[styles.ruleText, { fontSize: font(14) }]}>{rule.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Pinned to the bottom so Start is always in reach, even while scrolling the pickers. */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [styles.start, pressed && styles.startPressed]}
          >
            <Text style={[styles.startText, { fontSize: font(22) }]}>Start</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: {
    width: 84,
    height: 84,
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
    gap: spacing.sm,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  ruleIcon: {
    width: 24,
    textAlign: 'center',
  },
  ruleText: {
    flex: 1,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
