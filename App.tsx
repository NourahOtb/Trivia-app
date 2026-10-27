import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components';
import { QuizScreen } from './src/screens/QuizScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <QuizScreen />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
