/**
 * Categories and difficulties players can choose on the start screen.
 * To offer another category, add a row here with its Open Trivia DB id
 * (https://opentdb.com/api_category.php) — nothing else needs to change.
 * "Your own topic" (CUSTOM_CATEGORY) is always added at the end of the list.
 */
export const CATEGORIES = [
  { id: 'general', label: 'General Knowledge', icon: '🧠', apiId: 9 },
  { id: 'science', label: 'Science & Nature', icon: '🔬', apiId: 17 },
  { id: 'animals', label: 'Animals', icon: '🐪', apiId: 27 },
  { id: 'geography', label: 'Geography', icon: '🌍', apiId: 22 },
  { id: 'history', label: 'History', icon: '🏛️', apiId: 23 },
  { id: 'sports', label: 'Sports', icon: '⚽', apiId: 21 },
  { id: 'math', label: 'Mathematics', icon: '➗', apiId: 19 },
  { id: 'computers', label: 'Computers', icon: '💻', apiId: 18 },
  { id: 'film', label: 'Film', icon: '🎬', apiId: 11 },
  { id: 'music', label: 'Music', icon: '🎵', apiId: 12 },
  { id: 'video-games', label: 'Video Games', icon: '🎮', apiId: 15 },
  { id: 'art', label: 'Art', icon: '🎨', apiId: 25 },
] as const;

/** Players type their own topic and AI writes the questions (see api/questions.ts). */
export const CUSTOM_CATEGORY = { id: 'custom', label: 'Your own topic', icon: '✨' } as const;

/** Everything shown in the category picker, with "Your own topic" last. */
export const CATEGORY_CHOICES = [...CATEGORIES, CUSTOM_CATEGORY] as const;

export const MAX_TOPIC_LENGTH = 60;

export type CategoryId = (typeof CATEGORY_CHOICES)[number]['id'];
export type CategoryOption = (typeof CATEGORY_CHOICES)[number];

export const DIFFICULTIES = [
  { id: 'any', label: 'Mixed', icon: '🎲' },
  { id: 'easy', label: 'Easy', icon: '🙂' },
  { id: 'medium', label: 'Medium', icon: '🤔' },
  { id: 'hard', label: 'Hard', icon: '🔥' },
] as const;

export type DifficultyChoice = (typeof DIFFICULTIES)[number]['id'];

export const DEFAULT_CATEGORY: CategoryId = 'science';
export const DEFAULT_DIFFICULTY: DifficultyChoice = 'any';

export function getCategory(id: CategoryId): CategoryOption {
  return CATEGORY_CHOICES.find((c) => c.id === id) ?? CATEGORIES[0];
}

/** The Open Trivia DB category number, or null for "Your own topic". */
export function getApiId(id: CategoryId): number | null {
  return CATEGORIES.find((c) => c.id === id)?.apiId ?? null;
}

export function getDifficultyLabel(id: DifficultyChoice): string {
  return DIFFICULTIES.find((d) => d.id === id)?.label ?? 'Mixed';
}
