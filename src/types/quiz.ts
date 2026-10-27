export type Category = 'science-nature';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: Category;
  difficulty?: Difficulty;
  prompt: string;
  /** Exactly four options; `correctAnswer` must be one of them. */
  options: string[];
  correctAnswer: string;
  /** Short fun fact shown after the player answers. */
  funFact?: string;
}

export type QuizState =
  /** `retryInSeconds` is set while waiting to retry after "too many requests". */
  | { status: 'loading'; retryInSeconds?: number }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | {
      status: 'playing';
      questions: Question[];
      index: number;
      score: number;
      selectedAnswer: string | null;
    }
  | { status: 'finished'; questions: Question[]; score: number };

export type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'dimmed';
