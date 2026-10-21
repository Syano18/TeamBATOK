import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#ef4444', background: '#0f172a', padding: 24, margin: 20, borderRadius: 12, border: '1px solid #ef4444', fontFamily: 'monospace' }}>
          <h2>Component Error Encountered:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
            {this.state.error?.stack || this.state.error?.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', marginTop: 10 }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
