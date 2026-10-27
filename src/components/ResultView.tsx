import { StyleSheet, Text } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { StatusView } from './StatusView';

interface ResultViewProps {
  score: number;
  total: number;
  onPlayAgain: () => void;
}

function getVerdict(ratio: number) {
  if (ratio === 1) return { icon: '🏆', title: 'Perfect score!', message: 'A true science champion!' };
  if (ratio >= 0.6) return { icon: '🌟', title: 'Great job!', message: 'The family is proud of you.' };
  if (ratio >= 0.2) return { icon: '👍', title: 'Nice try!', message: 'Play again and beat your score.' };
  return { icon: '🌱', title: 'Keep growing!', message: 'Every scientist starts somewhere.' };
}

export function ResultView({ score, total, onPlayAgain }: ResultViewProps) {
  const { font } = useResponsive();
  const verdict = getVerdict(total > 0 ? score / total : 0);

  return (
    <StatusView icon={verdict.icon} title={verdict.title} message={verdict.message}>
      <Text
        accessibilityLabel={`Final score ${score} out of ${total}`}
        style={[styles.score, { fontSize: font(56) }]}
      >
        {score} / {total}
      </Text>
      <PrimaryButton title="Play again" onPress={onPlayAgain} />
    </StatusView>
  );
}

const styles = StyleSheet.create({
  score: {
    color: colors.primary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
});
