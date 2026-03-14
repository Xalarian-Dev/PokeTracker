import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">
                        Something went wrong
                    </h2>
                    <p className="text-gray-400 mb-6">
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-6 py-2 bg-poke-yellow text-gray-900 font-semibold rounded-lg hover:bg-poke-yellow-dark transition-colors"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
