import React from "react";
import { Button } from "../design-system/Button";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches render errors in any single challenge/page so one broken component
 * shows a recoverable fallback instead of white-screening the whole app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">Something went wrong rendering this page.</p>
          <p className="mt-1 text-xs text-red-600">{this.state.error.message}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={this.reset}>
              Try again
            </Button>
            <Button size="sm" onClick={() => (window.location.href = "/")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
