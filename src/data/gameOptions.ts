/**
 * Categories and difficulties players can choose on the start screen.
 * To offer another category, add a row here with its Open Trivia DB id
 * (https://opentdb.com/api_category.php) — nothing else needs to change.
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

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type CategoryOption = (typeof CATEGORIES)[number];

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
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function getDifficultyLabel(id: DifficultyChoice): string {
  return DIFFICULTIES.find((d) => d.id === id)?.label ?? 'Mixed';
}
