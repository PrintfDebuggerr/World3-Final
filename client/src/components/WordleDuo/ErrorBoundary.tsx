import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Oyun hatası:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center text-white">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold mb-4">Bir şeyler ters gitti!</h2>
            <p className="text-gray-300 mb-6">
              Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:scale-105 transition-transform"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
