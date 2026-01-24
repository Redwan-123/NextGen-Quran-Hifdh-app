import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <pre className="bg-red-50 p-4 rounded text-sm text-red-700">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}
