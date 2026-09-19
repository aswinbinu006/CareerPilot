import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareerPilot Uncaught Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#F8F7F4',
          color: '#1C1C1C',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#ffffff',
            padding: '36px',
            borderRadius: '24px',
            border: '1px solid #E2DDD3',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#EAEFE9',
              color: '#4A5C46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '20px',
            }}>
              ✦
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#1C1C1C', fontWeight: '600' }}>
              CareerPilot Advisory System
            </h1>
            <p style={{ fontSize: '13px', color: '#59636A', lineHeight: '1.6', marginBottom: '20px' }}>
              An unexpected display initialization occurred. Click below to resume your advisory session.
            </p>
            {this.state.error?.message && (
              <pre style={{
                background: '#F5F3ED',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#b91c1c',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '20px',
                fontFamily: 'monospace',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/';
              }}
              style={{
                padding: '12px 28px',
                background: '#1C1C1C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Restart Guidance Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
