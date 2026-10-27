import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FeedbackBanner,
  PrimaryButton,
  QuestionCard,
  ResultView,
  ScoreBar,
  StatusView,
} from '../components';
import { useQuiz } from '../hooks/useQuiz';
import { useResponsive } from '../hooks/useResponsive';
import { colors, MAX_CONTENT_WIDTH, spacing } from '../theme';

const QUESTION_COUNT = 5;

export function QuizScreen() {
  const { state, answer, next, restart } = useQuiz({
    category: 'science-nature',
    questionCount: QUESTION_COUNT,
  });
  const { font } = useResponsive();

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
            <PrimaryButton title="Try again" onPress={restart} />
          </StatusView>
        );

      case 'empty':
        return (
          <StatusView
            icon="📭"
            title="No questions right now"
            message="The question server didn't send any questions this time. Please try again."
          >
            <PrimaryButton title="Try again" onPress={restart} />
          </StatusView>
        );

      case 'finished':
        return (
          <ResultView score={state.score} total={state.questions.length} onPlayAgain={restart} />
        );

      case 'playing': {
        const question = state.questions[state.index];
        const answered = state.selectedAnswer !== null;
        const isLast = state.index === state.questions.length - 1;
        return (
          <View style={styles.playing}>
            <QuestionCard
              question={question}
              selectedAnswer={state.selectedAnswer}
              onAnswer={answer}
            />
            {answered && (
              <>
                <FeedbackBanner
                  isCorrect={state.selectedAnswer === question.correctAnswer}
                  correctAnswer={question.correctAnswer}
                  funFact={question.funFact}
                />
                <PrimaryButton title={isLast ? 'See final score' : 'Next question'} onPress={next} />
              </>
            )}
          </View>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: font(24) }]}>🔬 Science & Nature</Text>
          <Text style={[styles.subtitle, { fontSize: font(14) }]}>Family Trivia Night</Text>
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
    fontWeight: '800',
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
  playing: {
    gap: spacing.md,
  },
});
