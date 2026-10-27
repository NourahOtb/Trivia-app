export type Category = 'science-nature';

export interface Question {
  id: string;
  category: Category;
  prompt: string;
  /** Exactly four options; `correctAnswer` must be one of them. */
  options: string[];
  correctAnswer: string;
  /** Short fun fact shown after the player answers. */
  funFact?: string;
}

export type QuizState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'playing';
      questions: Question[];
      index: number;
      score: number;
      selectedAnswer: string | null;
    }
  | { status: 'finished'; questions: Question[]; score: number };

export type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'dimmed';
