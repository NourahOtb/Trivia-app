# Family Trivia — Science & Nature

A one-screen trivia game for family gatherings in Kuwait, built with React Native and Expo.
Each round picks 5 random questions from a hardcoded Science & Nature bank, shows right/wrong
after every tap, keeps the score visible, and ends with a final score and a **Play again** button.

## Run it on your phone (Expo Go)

Requires **Node 22.13+** (Expo SDK 58). With nvm: `nvm use 22`.

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (Android) or the Camera app (iOS).
Your phone and computer must be on the same Wi‑Fi.

## Project structure

```
App.tsx                      Root: safe-area provider + error boundary
src/
  screens/QuizScreen.tsx     The single game screen (loading / error / playing / finished)
  components/                Reusable UI: QuestionCard, AnswerButton, ScoreBar,
                             FeedbackBanner, PrimaryButton, StatusView, ResultView, ErrorBoundary
  hooks/useQuiz.ts           Game state machine (useReducer)
  hooks/useResponsive.ts     Screen-size helpers (font scaling, wide layouts)
  services/questionService.ts  Async question loader with validation and shuffling
  data/questions.ts          Hardcoded question bank
  theme/                     Colours, spacing, radii
  types/quiz.ts              Shared TypeScript types
```

## Adding questions or categories

- **More questions:** append to `src/data/questions.ts` (4 options, `correctAnswer` must match one).
  Invalid entries are filtered out automatically.
- **New category:** add a new data file, add the category name to `Category` in
  `src/types/quiz.ts`, and register it in `banks` in `src/services/questionService.ts`.
- **Moving to an API later:** only `getQuestions` needs to change; the UI already handles
  loading and error states.
