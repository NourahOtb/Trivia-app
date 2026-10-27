import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, ResultView, ScoreBar, StartView, StatusView } from '../components';
import { useQuiz } from '../hooks/useQuiz';
import { useResponsive } from '../hooks/useResponsive';
import { colors, MAX_CONTENT_WIDTH, spacing } from '../theme';
import { PlayingView, SECONDS_PER_QUESTION } from './PlayingView';

const APP_NAME = "Zwara's Trivia";
const QUESTION_COUNT = 5;

const RULES = [
  { icon: '🔬', text: `${QUESTION_COUNT} Science & Nature questions` },
  { icon: '⏳', text: `${SECONDS_PER_QUESTION} seconds for each question` },
  { icon: '✂️', text: '50/50 once per game: removes two wrong answers' },
];

export function QuizScreen() {
  const { state, answer, timeUp, fiftyFifty, next, start } = useQuiz({
    category: 'science-nature',
    questionCount: QUESTION_COUNT,
  });
  const { font } = useResponsive();

  if (state.status === 'start') {
    return (
      <StartView
        title={APP_NAME}
        subtitle="Family trivia for every gathering"
        rules={RULES}
        onStart={start}
      />
    );
  }

  const renderBody = () => {
    switch (state.status) {
      case 'loading':
        return (
          <StatusView
            icon={<ActivityIndicator size="large" color={colors.primary} />}
            title={state.retryInSeconds ? 'The server is busy' : 'Getting questions ready…'}
            message={
              state.retryInSeconds
                ? `Lots of people are playing! Trying again in ${state.retryInSeconds} seconds…`
                : 'Fetching fresh Science & Nature questions.'
            }
          />
        );

      case 'error':
        return (
          <StatusView icon="⚠️" title="Couldn't load the questions" message={state.message}>
            <PrimaryButton title="Try again" onPress={start} />
          </StatusView>
        );

      case 'empty':
        return (
          <StatusView
            icon="📭"
            title="No questions right now"
            message="The question server didn't send any questions this time. Please try again."
          >
            <PrimaryButton title="Try again" onPress={start} />
          </StatusView>
        );

      case 'finished':
        return (
          <ResultView score={state.score} total={state.questions.length} onPlayAgain={start} />
        );

      case 'playing':
        return (
          <PlayingView
            state={state}
            onAnswer={answer}
            onTimeUp={timeUp}
            onFiftyFifty={fiftyFifty}
            onNext={next}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: font(26) }]}>🔮 {APP_NAME}</Text>
          <Text style={[styles.subtitle, { fontSize: font(14) }]}>Science & Nature</Text>
        </View>

        {/* Kept outside the scroll view so the score is always visible. */}
        {state.status === 'playing' && (
          <ScoreBar score={state.score} current={state.index + 1} total={state.questions.length} />
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderBody()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
});
