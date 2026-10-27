import { Component, ReactNode } from 'react';

import { PrimaryButton } from './PrimaryButton';
import { StatusView } from './StatusView';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches unexpected render crashes and offers a way back instead of a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled UI error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <StatusView icon="😵" title="Oops!" message="Something unexpected happened.">
          <PrimaryButton title="Try again" onPress={() => this.setState({ hasError: false })} />
        </StatusView>
      );
    }
    return this.props.children;
  }
}
