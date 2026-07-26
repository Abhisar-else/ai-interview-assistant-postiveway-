import React from 'react';
import Card from './Card';
import Button from './Button';

/**
 * Mastery Implementation: Error Boundary
 * Catches runtime crashes and provides a graceful recovery path.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Runtime Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Card padding="lg">
            <h2 className="display-text" style={{ marginBottom: '16px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--color-ink-navy-60)', marginBottom: '24px' }}>
              We encountered an unexpected error while rendering this page.
            </p>
            <Button variant="accent" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
