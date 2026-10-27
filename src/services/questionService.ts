import { scienceNatureQuestions } from '../data/questions';
import { Category, Question } from '../types/quiz';
import { shuffle } from '../utils/shuffle';

const OPTIONS_PER_QUESTION = 4;

const banks: Record<Category, Question[]> = {
  'science-nature': scienceNatureQuestions,
};

export class QuestionLoadError extends Error {}

function isValid(q: Question): boolean {
  return (
    q.prompt.trim().length > 0 &&
    q.options.length === OPTIONS_PER_QUESTION &&
    new Set(q.options).size === OPTIONS_PER_QUESTION &&
    q.options.includes(q.correctAnswer)
  );
}

/**
 * Loads a random set of questions for a category.
 *
 * It is async on purpose: the data is hardcoded today, but the rest of the
 * app already handles loading and error states, so this function can later
 * be swapped for a network or database call without changing any UI.
 */
export async function getQuestions(category: Category, count: number): Promise<Question[]> {
  const bank = banks[category];
  if (!bank) {
    throw new QuestionLoadError(`Unknown category: ${category}`);
  }

  const valid = bank.filter(isValid);
  if (valid.length < count) {
    throw new QuestionLoadError(
      `Not enough questions available (need ${count}, found ${valid.length}).`,
    );
  }

  return shuffle(valid)
    .slice(0, count)
    .map((q) => ({ ...q, options: shuffle(q.options) }));
}
